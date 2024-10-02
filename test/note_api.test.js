import { test, before, after, afterEach, beforeEach } from "node:test";
import assert, { strictEqual } from "node:assert";
import config from "../utils/config.js";
import mongoose from "mongoose";
import supertest from "supertest";
import app from "../app.js";
import Note from "../models/note.js";
import helper from "./test_helper.js";
import { MongoMemoryServer } from "mongodb-memory-server";

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

beforeEach(async () => {
  await Note.deleteMany({});
  let noteObject = new Note(helper.initialNotes[0]);
  await noteObject.save();
  noteObject = new Note(helper.initialNotes[1]);
  await noteObject.save();
});
const api = supertest(app);

test("notes are returned as json", async () => {
  await api
    .get("/api/notes")
    .expect(200)
    .expect("Content-Type", /application\/json/);
});

test("all notes are returned", async () => {
  const response = await api.get("/api/notes");

  assert.strictEqual(response.body.length, helper.initialNotes.length);
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

test("a valid note can be added ", async () => {
  const newNote = {
    content: "async/await simplifies making async calls",
    important: true,
  };

  await api
    .post("/api/notes")
    .send(newNote)
    .expect(201)
    .expect("Content-Type", /application\/json/);

  const notesAtEnd = await helper.notesInDb();
  assert.strictEqual(notesAtEnd.length, helper.initialNotes.length + 1);
  const contents = notesAtEnd.map((n) => n.content);
  assert(contents.includes("async/await simplifies making async calls"));
});

test("note without content is not added", async () => {
  const newNote = {
    important: true,
  };

  await api.post("/api/notes").send(newNote).expect(400);

  // const response = await api.get("/api/notes");
  const notesAtEnd = await helper.notesInDb();
  assert.strictEqual(notesAtEnd.length, helper.initialNotes.length);
});

test("a specific note can be viewed", async () => {
  const notesAtStart = await helper.notesInDb();

  const noteToView = notesAtStart[0];

  const resultNote = await api
    .get(`/api/notes/${noteToView.id}`)
    .expect(200)
    .expect("Content-Type", /application\/json/);

  assert.deepStrictEqual(resultNote.body, noteToView);
});

test("a note can be deleted", async () => {
  const notesAtStart = await helper.notesInDb();
  const noteToDelete = notesAtStart[0];

  await api.delete(`/api/notes/${noteToDelete.id}`).expect(204);

  const notesAtEnd = await helper.notesInDb();

  const contents = notesAtEnd.map((r) => r.content);
  assert(!contents.includes(noteToDelete.content));

  assert.strictEqual(notesAtEnd.length, helper.initialNotes.length - 1);
});

after(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});
