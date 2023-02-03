const router = require("express").Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Prof = require("../models/teacher");
const Student = require("../models/student");

router.get("/", async (req, res) => {
  await Prof.find()
    .then((prof) => {
      // res.header("Content-Type", "application/json");
      // res.send(JSON.stringify(prof, null, 4));
      res.json(prof);
    })
    .catch((err) => res.status(400).json(err));
});

// add proffesor
router.post("/register", async (req, res) => {
  const fullname = req.body.fullname;
  const age = req.body.age;
  const prof_id = req.body.studId;
  const birthday = req.body.birthday;
  const major = req.body.major;
  const email = req.body.email;
  const password = req.body.password;

  const profEmail = await Prof.findOne({ email: email });
  if (profEmail)
    return res.status(409).send({ message: "This email is already exist." });

  const profId = await Prof.findOne({ prof_id: prof_id });
  if (profId)
    return res.status(409).send({
      message: "This ID is belong to someone that is already exist.",
    });

  const salt = await bcrypt.genSalt(Number(process.env.SALT));
  const hashPassword = await bcrypt.hash(password, salt);

  const newProf = new Prof({
    fullname,
    age,
    prof_id,
    birthday,
    major,
    email,
    hashPassword,
  });

  newProf
    .save()
    .then((result) => res.json("New Proffesor Successfully Registered."))
    .catch((err) => res.status(400).json(err));
});

// ADD SECTION_HANDLE
router.put("/add/section/:id", async (req, res) => {
  const class_code = req.body.class_code;
  const section = req.body.section;
  const room = req.body.room;
  const time = req.body.time;
  const day = req.body.day;

  const ProfSection = {
    class_code,
    section,
    room,
    time,
    day,
  };

  const isSectionExist = await Prof.find({
    _id: req.params.id,
    section_handle: {
      $elemMatch: {
        class_code: class_code,
      },
    },
  });

  if (isSectionExist.length > 0)
    return res.status(409).json("Section Class Code Already Exist.");

  await Prof.findByIdAndUpdate(
    { _id: req.params.id },
    { $push: { section_handle: ProfSection } }
  )
    .then((prof) => {
      res.json("New Section Successfully Added.");
    })
    .catch((err) => res.status(400).json(err));
});

// Delete Section_Handle
router.put("/delete/section/:id", async (req, res) => {
  const class_code = req.body.class_code;

  await Prof.findOneAndUpdate(
    { _id: req.params.id },
    {
      $pull: {
        section_handle: {
          class_code: class_code,
        },
        multi: true,
      },
    }
  )
    .then((result) => res.json("Section Deleted."))
    .catch((err) => res.status(400).json(err));
});

// ADD STUDENT TO THE SECTION
router.put("/enroll/student/:id", async (req, res) => {
  const studname = req.body.studname;
  const studId = req.body.studId;
  const class_code = req.body.class_code;

  const student = [
    {
      studname,
      studId,
    },
  ];

  // check the student if exist in student DB
  const isStudentExist = await Student.findById(studId);
  if (!isStudentExist)
    return res.status(404).json(" Student Must Be Enroll First.");

  // check if the student is enrolled
  const isStudentErolled = await Prof.find({
    "section_handle.students": {
      $elemMatch: {
        studId: studId,
      },
    },
  });
  if (isStudentErolled.length > 0)
    return res.status(409).json(" Student Is Already Enrolled.");

  await Prof.findOneAndUpdate(
    { "section_handle.class_code": class_code },
    {
      $push: {
        "section_handle.$.students": student,
      },
    }
  )
    .then((result) => {
      res.json("New Student Successfully Addded To Your Class.");
    })
    .catch((err) => {
      res.status(400).json(err);
      console.log(err);
    });
});

// Delete Student From the Section
router.put("/delete/student/:id", async (req, res) => {
  const studId = req.body.studId;
  const class_code = req.body.class_code;

  await Prof.findOneAndUpdate(
    { _id: req.params.id, "section_handle.class_code": class_code },
    {
      $pull: {
        "section_handle.$.students": {
          studId: studId,
        },
      },
    }
  )
    .then((result) => res.json("Student Remove Successfully."))
    .catch((err) => res.status(400).json(err));
});

module.exports = router;
