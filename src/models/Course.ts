import mongoose, { Schema, model, models } from "mongoose";

const CourseSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Course title is required"],
    },
    description: {
      type: String,
      required: [true, "Course description is required"],
    },
    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      required: [true, "Level is required"],
    },
    duration: {
      type: String,
      required: [true, "Duration is required (e.g., 8 Weeks)"],
    },
    iconName: {
      // Name of the lucide-react or 3D icon to show
      type: String,
      default: "BookOpen",
    },
    price: {
      type: Number,
      default: 0,
    },
    modules: [
      {
        title: { type: String, required: true },
        description: { type: String },
        videoUrl: { type: String },
        notesUrl: { type: String },
      }
    ],
  },
  {
    timestamps: true,
  }
);

// In development, handle hot-reloading by clearing the model
if (process.env.NODE_ENV === "development" && mongoose.models.Course) {
  delete mongoose.models.Course;
}

const Course = models.Course || model("Course", CourseSchema);

export default Course;
