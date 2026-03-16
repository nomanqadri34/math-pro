import mongoose, { Schema, model, models } from "mongoose";

const LiveClassSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    instructor: {
      type: String,
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    duration: {
      type: String, // e.g., "60 mins"
    },
    meetingUrl: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["upcoming", "live", "ended"],
      default: "upcoming",
    },
  },
  {
    timestamps: true,
  }
);

const LiveClass = models.LiveClass || model("LiveClass", LiveClassSchema);

export default LiveClass;
