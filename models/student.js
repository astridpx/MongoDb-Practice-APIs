const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      uppercase: true,
      trim: true,
    },

    age: {
      type: Number,
    },

    stud_id: {
      type: String,
      uppercase: true,
      trim: true,
      unique: true,
    },

    section: {
      type: String,
      uppercase: true,
      trim: true,
    },

    birthday: {
      type: Date,
    },

    subjects: [
      {
        _id: false,
        proffesor: mongoose.Schema.Types.ObjectId, // id of proffesor
        subject: String,
        time: String,
        day: String, // from monday to sunday
        room: Number,
      },
    ],

    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
    },

    password: {
      type: String,
      trim: true,
    },
  },

  {
    timestamps: true,
  }
);

const Student = mongoose.model("Students", studentSchema);
module.exports = Student;
