import bcrypt from "bcrypt";
import express from "express";
const usersRouter = express.Router();
import User from "../models/user.js";

usersRouter.post("/", async (request, response, next) => {
  const { username, name, password } = request.body;

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const user = new User({
    username,
    name,
    passwordHash,
  });

  const savedUser = await user.save();

  response.status(201).json(savedUser);
});

usersRouter.get("/", async (request, response, next) => {
  const users = await User.find({}).populate("notes", {
    content: 1,
    important: 1,
  });
  response.json(users);
});

export default usersRouter;
