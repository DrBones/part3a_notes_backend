import { test, before, after, afterEach, beforeEach } from "node:test";
import { strictEqual } from "node:assert";
import config from "../utils/config.js";
import mongoose from "mongoose";
import supertest from "supertest";
import app from "../app.js";
import Note from "../models/note.js";
import { MongoMemoryServer } from "mongodb-memory-server";

const initialNotes = [
  {
    content: "HTML is easy",
    important: false,
  },
  {
    content: "Browser can execute only JavaScript",
    important: true,
  },
];
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
  // await Note.deleteMany({});
  let noteObject = new Note(initialNotes[0]);
  await noteObject.save();
  noteObject = new Note(initialNotes[1]);
  await noteObject.save();
});
const api = supertest(app);

test("notes are returned as json", async () => {
  await api
    .get("/api/notes")
    .expect(200)
    .expect("Content-Type", /application\/json/);
});

test("there are two notes", async () => {
  const response = await api.get("/api/notes");

  strictEqual(response.body.length, 2);
});

test("one of the notes is about HTTP methods", async () => {
  const response = await api.get("/api/notes");

  const contents = response.body.map((e) => e.content);
  strictEqual(contents.includes("HTML is easy"), true);
});

after(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});
