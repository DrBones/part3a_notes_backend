import express from "express";
const notesRouter = express.Router();
import Note from "../models/note.js";

notesRouter.get("/", async (request, response) => {
  const notes = await Note.find({});
  response.json(notes);
});

notesRouter.get("/:id", async (request, response, next) => {
  const note = await Note.findById(request.params.id);
  if (note) {
    response.json(note);
  } else {
    response.status(404).end();
  }
});

notesRouter.post("/", async (request, response, next) => {
  const body = request.body;
  const note = new Note({
    content: body.content,
    important: body.important || false,
  });
  const savedNote = await note.save();
  response.status(201).json(savedNote);
});

notesRouter.delete("/:id", async (request, response, next) => {
  await Note.findByIdAndDelete(request.params.id);
  response.status(204).end();
});

notesRouter.put("/:id", async (request, response, next) => {
  const { content, important } = request.body;

  // const note = {
  //   content: body.content,
  //   important: body.important,
  // };

  const updatedNote = await Note.findByIdAndUpdate(
    request.params.id,
    { content, important },
    { new: true, runValidators: true, context: "query" }
  );
  response.json(updatedNote);
});

export default notesRouter;
