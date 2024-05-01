const express = require("express");
const cors = require("cors");
const app = express();
const db = require("../db");
const bcrypt = require("bcrypt");
// const validInfo = require("../middleware/validInfo");
const asyncWrapper = require('express-async-handler')
const { jwtGenerator, jwtDecoder } = require("../utils/jwtToken");
const { authorizeStudent } = require('../middleware/auth')
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer")
app.use(cors());
app.use(express.json());

exports.userRegister = asyncWrapper(async (req, res) => {
  const { full_name, email, phone, password, type } = req.body;

  try {
    const user = await db.pool.query("SELECT * FROM users WHERE email = $1", [
      email
    ]);

    if (user.rows.length > 0) {
      return res.status(401).json("User already exist!");
    }

    const salt = await bcrypt.genSalt(10);
    const bcryptPassword = await bcrypt.hash(password, salt);

    let newUser = await db.pool.query(
      "INSERT INTO users (full_name, email,  phone, password,  type) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [full_name, email, phone, bcryptPassword, type]
    );

    const jwtToken = jwtGenerator(newUser.rows[0].id, newUser.rows[0].type);

    if (type === "student") {
      const { block_id, usn, room } = req.body;
      console.log(newUser.rows);
      await db.pool.query(
        "INSERT INTO student (student_id, block_id, usn, room) VALUES ($1, $2, $3, $4)",
        [newUser.rows[0].user_id, block_id, usn, room]
      );
    } else if (type === "warden") {
      const { block_id } = req.body;
      await db.pool.query(
        "INSERT INTO warden (warden_id,block_id) VALUES ($1, $2)",
        [newUser.rows[0].user_id, block_id]
      );
    } else if (type === "worker") {
      await db.pool.query(
        "INSERT INTO worker (worker_id,category_id ) VALUES ($1,$2 )",
        [newUser.rows[0].user_id, null]
      );
    }

    return res.json({ jwtToken });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

exports.userLogin = asyncWrapper(async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await db.pool.query("SELECT * FROM users WHERE email = $1", [
      email
    ]);

    if (user.rows.length === 0) {
      return res.status(401).json("Invalid Credential");
    }

    const validPassword = await bcrypt.compare(
      password,

      user.rows[0].password
    );

    if (!validPassword) {
      return res.status(401).json("Invalid Credential");
    }
    const jwtToken = jwtGenerator(user.rows[0].user_id, user.rows[0].type);
    console.log(jwtDecoder(jwtToken))
    return res.json({ jwtToken });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});





const sendOtp = async (email) => {
  console.log("2")

  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: "arjuncollegeoftechnology242@gmail.com",
      pass: "srbb swjl rxti zibd",
    },
  });


  const genrateOtp = () => {
    console.log("3")

    let otp = "";
    for (let i = 0; i < 6; i++) {
      otp += Math.floor(Math.random() * 10)
    }
    return otp
  }
  //send email function
  const otp = genrateOtp();
  try {
    console.log("4")

    const info = await transporter.sendMail({
      from: {
        name: "arjun college of technology",
        email: "arjuncollegeoftechnology242@gmail.com",
      },
      to: email,
      subject: "OTP to verify your email",
      text: `use this code to verify yourself -- ${otp}`,
    });
    console.log("5")

    return { otp, info };
  } catch (error) {
    console.log(error.message);
    return null;
  }
};





exports.verifyEmail = asyncWrapper(async (req, res) => {
  const { email } = req.body;
  console.log("1")
  const { otp, info } = await sendOtp(email)
  console.log("6", "info", info)

  try {
    console.log("7")

    if (info) {
      res.status(200).json({ otp, message: "otp sent successfull" })
    } else {
      res.status(400).json({ message: "error while sending otp" })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }

})