console.log("Notes Backend Starting");
import "dotenv/config";
import express from "express";
import cors from "cors";
import Note from "./models/note.js";
import mongoose from "mongoose";
const app = express();

app.use(express.json());
app.use(express.static("dist"));
app.use(cors());

let notes = [
  {
    id: "1",
    content: "HTML is easy",
    important: true,
  },
  {
    id: "2",
    content: "Browser can execute only JavaScript",
    important: false,
  },
  {
    id: "3",
    content: "GET and POST are the most important methods of HTTP protocol",
    important: true,
  },
];

app.get("/", (req, res) => {
  res.send("<h1>Hello, World!</h1>");
});

app.get("/api/notes", (req, res) => {
  Note.find({}).then((notes) => res.send(notes));
});

app.get("/api/notes/:id", (req, res) => {
  const id = req.params.id;
  // const note = notes.find((note) => note.id === id);
  if (mongoose.isValidObjectId(id)) {
    Note.findById(id)
      .then((note) => {
        if (note) {
          res.json(note);
        } else {
          res.status(404).end();
        }
      })
      .catch((error) => {
        console.log(error);
        res.status(500).end();
      });
  } else {
    res.status(404).end();
  }
  // if (note) {
  //   res.send(note);
  // } else {
  //   res.statusMessage = "No note with that id found";
  //   res.status(404).end();
  // }
});

app.delete("/api/notes/:id", (req, res) => {
  const id = req.params.id;
  notes = notes.filter((note) => note.id !== id);
  res.status(204).end();
});

app.post("/api/notes", (req, res) => {
  const body = req.body;

  if (!body.content) {
    return res.status(400).json({ error: "Content is Missing" });
  }
  const note = new Note({
    content: body.content,
    important: Boolean(body.important) || false,
    // id: generateID(),
  });
  note.save().then((savedNote) => {
    res.json(savedNote);
  });
  // notes = notes.concat(note);
  // res.json(note);
  // console.log(note);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
