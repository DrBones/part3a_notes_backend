import mongoose, { Mongoose } from "mongoose";

if (process.argv.length < 3) {
  console.log("give password as argument");
  process.exit();
}

const password = process.argv[2];

const url = `mongodb+srv://jnssieglmongoatlas:${password}@fullstackopen.hl2g9.mongodb.net/noteApp?retryWrites=true&w=majority&appName=fullstackopen`;

mongoose.set("strictQuery", false);

mongoose.connect(url);

const noteSchema = new mongoose.Schema({
  content: String,
  important: Boolean,
});

let notesData = [
  {
    content: "HTML is easy",
    important: true,
  },
  {
    content: "Browser can execute only JavaScript",
    important: false,
  },
  {
    content: "GET and POST are the most important methods of HTTP protocol",
    important: true,
  },
];

const Note = mongoose.model("Note", noteSchema);

// const note = new Note({
//   content: "",
//   important: false,
// });
// const promiseArray = notesData.map((note) => {
//   const newNote = new Note(note);
//   return newNote.save();
// });
// await Promise.all(promiseArray).then(() => {
//   console.log("All promises have resolved");
//   mongoose.connection.close();
// });

// const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
// console.log("Promise Chaining");
// notesData.reduce(async (p, _, i) => {
//   console.log("promise created for note", i);
//   await p
//     .then(() => delay(Math.random() * 1000))
//     .then(() => {
//       console.log("Promise resolved for note", i);
//     });
// }, Promise.resolve());
// console.log("All items sent for processing");

// console.log("Creating Promise Array");
// const promiseArray = notesData.map(async (element, index, _) => {
//   console.log("Promise created for element", index);
//   await delay(Math.random() * 1000).then(() =>
//     console.log("Promise has been resolved for", index)
//   );
// });
// Promise.all(promiseArray).then(() => {
//   console.log("All promises have resolved");
//   // mongoose.connection.close();
// });

// console.log("Creating Promise Array");
// const promiseArray = notesData.map(async (note, index, _) => {
//   console.log("Promise created for note", index);
//   const newNote = new Note(note);
//   await newNote
//     .save()
//     .then(() => console.log("Promise has been resolved for note", index));
// });
// Promise.all(promiseArray).then(() => {
//   console.log("All promises have resolved");
//   mongoose.connection.close();
// });
Note.find({ important: true }).then((result) => {
  result.forEach((note) => {
    console.log(note);
  });
  mongoose.connection.close();
});
