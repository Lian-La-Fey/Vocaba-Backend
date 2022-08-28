import mongoose from "mongoose";

const tokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "user",
    unique: true,
  },
  token: { type: String, required: true },
  createdAt: { type: Date, default: Date.now() },
});

tokenSchema.index({ createdAt: 1 }, { expireAfterSeconds: 3600 })

export const Token = mongoose.model("Token", tokenSchema);
