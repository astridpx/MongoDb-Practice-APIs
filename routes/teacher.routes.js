const router = require("express").Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Prof = require("../models/teacher");
const Student = require("../models/student");

router.get("/", async (req, res) => {
  await Prof.find()
    .populate({
      path: "section_handle.students",
    })
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
  const studId = req.body.studId;
  const class_code = req.body.class_code;

  let studentExistId; // this will hold the array from the student fllter

  // Function for student nested array
  // @desc this will get the array of the students that will pass in studntExistId
  const isStudentAlreadyEnrolled = (students) => {
    students
      .filter((stud) => stud.class_code === class_code)
      .map((student) => {
        studentExistId = student.students;
      });
  };

  // check the student if exist in student DB
  const isStudentExist = await Student.findById(studId);
  if (!isStudentExist)
    return res.status(404).json("Student Must Be Enroll First.");

  // check if the student is enrolled
  const isStudentErolled = await Prof.findOne({
    section_handle: {
      $elemMatch: {
        class_code: class_code,
        // student: { $in: studId },
      },
    },
  });

  // Prevent the class code error if its not exist
  if (isStudentErolled === null)
    return res.status(400).json("Class Code not Found.");

  isStudentAlreadyEnrolled(isStudentErolled.section_handle);

  // Prevent the student enroll again
  if (studentExistId.includes(studId))
    return res.status(409).json("Student Is Already Enrolled.");

  await Prof.findOneAndUpdate(
    { "section_handle.class_code": class_code },
    {
      $push: {
        "section_handle.$.students": studId,
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
        "section_handle.$.students": studId,
      },
    }
  )
    .then((result) => res.json("Student Remove Successfully."))
    .catch((err) => res.status(400).json(err));
});

// Update Proffessor Details
router.put("/update/proffesor/:id", async (req, res) => {
  const isProfId = await Prof.findOne({ prof_id: req.body.prof_id });

  await Prof.findByIdAndUpdate(req.params.id).then((proffesor) => {
    proffesor.fullname = req.body.fullname
      ? req.body.fullname
      : proffesor.fullname;
    proffesor.age = req.body.age ? req.body.age : proffesor.age;
    proffesor.prof_id = req.body.studId ? req.body.prof_id : proffesor.prof_id;
    proffesor.birthday = req.body.birthday
      ? req.body.birthday
      : proffesor.birthday;
    proffesor.major = req.body.major ? req.body.major : proffesor.major;
    proffesor.email = req.body.email ? req.body.email : proffesor.email;
    proffesor.password = req.body.password
      ? req.body.password
      : proffesor.password;

    // PREVENT THE ID ERROR NULL
    if (isProfId === null)
      return proffesor
        .save()
        .then((result) => res.json("Update Status Success."))
        .catch((err) => res.status(400).json(err));

    // Prevent creating same ID
    if (isProfId.id != req.params.id)
      return res.status(409).json("This  ID is belong to someone.");

    proffesor
      .save()
      .then((result) => res.json("Update status Success."))
      .catch((err) => res.status(400).json(err));
  });
});

module.exports = router;
