import mongoose, { Schema, models } from "mongoose";

const TodoSchema = new Schema({
  text: { type: String, required: true },
  completed: { type: Boolean, default: false },
  comments: { type: Number, default: 0 },
  time: { type: String },
  date: { type: String },
  label: { type: String, default: "Dev" },
});

const Todo = models.Todo || mongoose.model("Todo", TodoSchema);

export default Todo;
