import mongoose, { Schema, models } from "mongoose";

const UserPreferenceSchema = new Schema({
  userId: { type: String, required: true, unique: true },
  theme: { type: String, default: "system" },
  accent: { type: String, default: "#8054e9" },
  accentHover: { type: String, default: "#6c44d1" },
});

export default models.UserPreference ||
  mongoose.model("UserPreference", UserPreferenceSchema);
