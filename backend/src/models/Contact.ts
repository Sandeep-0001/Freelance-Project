import mongoose from "mongoose";

const ContactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  subject: {
    type: String,
    required: true,
    trim: true,
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ["pending", "read", "replied"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const ContactModel = mongoose.model("Contact", ContactSchema);
