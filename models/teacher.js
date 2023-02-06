const mongoose = require("mongoose");

const studentsSchema = [
  {
    // _id: false,
    // studname: String,
    type: mongoose.Schema.Types.ObjectId,
    ref: "Students",
  },
];

const teacherSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      uppercase: true,
      trim: true,
    },

    age: {
      type: Number,
    },

    prof_id: {
      type: String,
      trim: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    birthday: {
      type: Date,
    },

    section_handle: [
      {
        _id: false,

        class_code: {
          type: String,
          uppercase: true,
          unique: true,
          trim: true,
        },

        section: {
          type: String,
          uppercase: true,
          trim: true,
        },

        room: Number,

        time: {
          type: String,
        },

        day: {
          type: String, // from monday to sunday
          uppercase: true,
          trim: true,
        },

        students: studentsSchema,
      },
    ],

    major: {
      type: String,
      uppercase: true,
      trim: true,
    },

    email: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
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

const Prof = mongoose.model("Proffesor", teacherSchema);
module.exports = Prof;
