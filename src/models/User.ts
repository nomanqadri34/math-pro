import mongoose, { Schema, model, models } from "mongoose";

const UserSchema = new Schema(
  {
    email: {
      type: String,
      unique: true,
      required: [true, "Email is required"],
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Email is invalid",
      ],
    },
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    password: {
      type: String,
      select: false,
    },
    role: {
      type: String,
      enum: ["student", "admin", "school"],
      default: "student",
    },
    mentorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    assignedCourses: [
      { type: Schema.Types.ObjectId, ref: "Course" }
    ],
    points: {
      type: Number,
      default: 0,
    },
    enrolledCourses: [
      {
        courseId: { type: Schema.Types.ObjectId, ref: "Course" },
        progress: { type: Number, default: 0 },
        enrolledAt: { type: Date, default: Date.now },
      }
    ],
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

if (process.env.NODE_ENV === "development") {
  delete (models as any).User;
}

const User = models.User || model("User", UserSchema);

export default User;
