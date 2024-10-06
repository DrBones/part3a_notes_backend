import bcrypt from "bcrypt";
import { test, before, after, beforeEach, describe } from "node:test";
import assert, { strictEqual } from "node:assert";
import config from "../utils/config.js";
import mongoose from "mongoose";
import supertest from "supertest";
import app from "../app.js";
import Note from "../models/note.js";
import User from "../models/user.js";
import helper from "./test_helper.js";
import { MongoMemoryServer } from "mongodb-memory-server";

describe("when there is initially one user in db", () => {
  let mongoServer;
  before(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    console.log("connecting to", mongoUri);
    await mongoose
      .connect(mongoUri)
      .then(() => {
        console.log("connected to MongoDB");
      })
      .catch((error) => {
        console.log("error connecting to MongoDB:", error.message);
      });
  });

  const api = supertest(app);
  beforeEach(async () => {
    await User.deleteMany({});

    const passwordHash = await bcrypt.hash("sekret", 10);
    const user = new User({ username: "root", passwordHash });

    await user.save();
  });

  test("creation succeeds with a fresh username", async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: "mluukkai",
      name: "Matti Luukkainen",
      password: "salainen",
    };

    await api
      .post("/api/users")
      .send(newUser)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const usersAtEnd = await helper.usersInDb();
    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1);

    const usernames = usersAtEnd.map((u) => u.username);
    assert(usernames.includes(newUser.username));
  });

  test("creation fails with proper statuscode and message if username already taken", async () => {
    const usersAtStart = await helper.usersInDb();
    const newUser = {
      username: "root",
      name: "Superuser",
      password: "salainen",
    };

    const result = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);
    const usersAtEnd = await helper.usersInDb();
    assert(result.body.error.includes("expected `username` to be unique"));

    assert.strictEqual(usersAtEnd.length, usersAtStart.length);
  });
  after(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });
});
