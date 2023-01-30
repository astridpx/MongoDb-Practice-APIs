const router = require("express").Router();
const jwt = require("jsonwebtoken");
const Student = require("../models/student");
const bcrypt = require("bcrypt");
const moment = require("moment");

router.get("/", async (req, res) => {
  await Student.find()
    .then((result) => {
      res.json(result);
    })
    .catch((err) => res.status(400).json(err));
});

// add user
router.post("/register", async (req, res) => {
  const fullname = req.body.fullname;
  const age = req.body.age;
  const stud_id = req.body.studId;
  const section = req.body.section;
  const birthday = req.body.birthday;
  const email = req.body.email;
  const password = req.body.password;

  const emails = await Student.findOne({ email: email });
  if (emails)
    return res.status(409).send({ message: "This email is already exist." });

  const studIds = await Student.findOne({ stud_id: stud_id });
  if (studIds)
    return res.status(409).send({
      message: "This ID is belong to someone that is already exist.",
    });

  const salt = await bcrypt.genSalt(Number(process.env.SALT));
  const hashPassword = await bcrypt.hash(password, salt);

  const newStudent = new Student({
    fullname,
    age,
    stud_id,
    section,
    birthday,
    email,
    hashPassword,
  });

  newStudent
    .save()
    .then((result) => res.json("New Student Successfully Registered."))
    .catch((err) => res.status(400).json(err));
});

module.exports = router;
