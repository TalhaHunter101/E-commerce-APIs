const coustomer = require("../Schema/coustomer_schema");
const admin = require("../Schema/admin_schema");
const Evalid = require("../middleware/Emailvalidator");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
var express = require("express");
var jwt = require("jsonwebtoken");
var app = express();
dotenv.config();
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.json());

exports.signup = async function (req, res) {
  if (req.body.fullname == "" || req.body.fullname == undefined) {
    res.status(400).json({ Message: "Missing Full Name: try Again" });
    return;
  } else if (req.body.email == "" || req.body.email == undefined) {
    res.status(400).json({ Message: "Missing Email:: Try again" });
    return;
  } else if (req.body.password == "" || req.body.password == undefined) {
    res.status(400).json({ Message: "Missing Password:: Try again" });
    return;
  } else if (req.body.password.length < 6) {
    res
      .status(411)
      .json({ Message: "Password should be at least 6 characters" });
    return;
  } else if (Evalid.validateEmailAddress(req.body.email) === -1) {
    res.status(400).json({ Message: "Incorrect email :: Enter again" });
    return;
  } else if (req.body.type == "" || req.body.type == undefined) {
    res.status(400).json({ Message: "Type missing :: Enter again" });
    return;
  } else if (req.body.type == "coustomer") {
    await coustomer.findOne({ email: req.body.email }).then((user) => {
      if (user) {
        // user already present
        return res
          .status(409)
          .json({ Message: "You are already registered ..." });
      } else {
        // creating new
        let NewUser = new coustomer({
          fullname: req.body.fullname,
          email: req.body.email,
          password: req.body.password,
        });
        const emil = req.body.email;
        const U_type = req.body.type;
        const token = jwt.sign(
          { user_id: NewUser._id, emil, U_type },
          process.env.TOKEN_SECRET,
          {
            expiresIn: "5h",
          }
        );
        NewUser.save()
          .then((events) => {
            res.status(200).json({
              Message: `Coustomer User Registered`,
              Token: `${token}`,
            });
          })
          .catch((err) => {
            console.log(err);
            res.end();
          });
      }
    });
  } else if (req.body.type == "admin") {
    await admin.findOne({ email: req.body.email }).then((user) => {
      if (user) {
        // user already present
        return res
          .status(409)
          .json({ Message: "You are already registered ..." });
      } else {
        // creating new
        let NewUser = new admin({
          fullname: req.body.fullname,
          email: req.body.email,
          password: req.body.password,
        });
        const emil = req.body.email;
        const U_type = req.body.type;
        const token = jwt.sign(
          { user_id: NewUser._id, emil, U_type },
          process.env.TOKEN_SECRET,
          {
            expiresIn: "5h",
          }
        );
        NewUser.save()
          .then((events) => {
            res.status(200).json({
              Message: `Admin user registered`,
              Token: `${token}`,
            });
          })
          .catch((err) => {
            console.log(err);
            res.end();
          });
      }
    });
  } else {
    res.status(400).json({
      Message: "Type should be 'admin' or 'coustomer' (lowercase)",
    });
    return;
  }
};
// exports.reset_pass = async function (req, res) {};
// exports.forget_pass = async function (req, res) {};
exports.login = async function (req, res) {
  console.log(req.body);
  if (req.body.email == "" || req.body.email == undefined) {
    res.status(400).json({ Message: "Missing Email:: Try again" });
    return;
  } else if (req.body.password == "" || req.body.password == undefined) {
    res.status(400).json({ Message: "Missing Password:: Try again" });
    return;
  } else if (req.body.password.length < 6) {
    res
      .status(411)
      .json({ Message: "Password should be at least 6 characters" });
    return;
  } else if (Evalid.validateEmailAddress(req.body.email) === -1) {
    res.status(400).json({ Message: "Incorrect email :: Enter again" });
    return;
  } else if (req.body.type == "" || req.body.type == undefined) {
    res.status(400).json({ Message: "Type missing :: Enter again" });
    return;
  } else if (req.body.type == "coustomer") {
    await coustomer.findOne({ email: req.body.email }).then((user) => {
      if (user) {
        // user Found in record
        const verifypass = bcrypt.compareSync(req.body.password, user.password);
        if (verifypass == true) {
          const emil = req.body.email;
          const U_type = req.body.type;
          const token = jwt.sign(
            { user_id: user._id, emil, U_type },
            process.env.TOKEN_SECRET,
            {
              expiresIn: "5h",
            }
          );
          res.status(200).json({
            Message: `Login succesfull :: Welcome ${user.fullname} `,
            Token: `${token}`,
          });
        } else {
          res.status(400).json({
            Message: `Incorrect Credentials`,
          });
        }
      } else {
        res.status(400).json({ Message: "You are not our registered user" });
        return;
      }
    });
  } else if (req.body.type == "admin") {
    await admin.findOne({ email: req.body.email }).then((user) => {
      if (user) {
        // user Found in record
        const verifypass = bcrypt.compareSync(req.body.password, user.password);
        if (verifypass == true) {
          const emil = req.body.email;
          const U_type = req.body.type;
          const token = jwt.sign(
            { user_id: user._id, emil, U_type },
            process.env.TOKEN_SECRET,
            {
              expiresIn: "5h",
            }
          );
          res.status(200).json({
            Message: `Login succesfull :: Welcome ${user.fullname} `,
            Token: `${token}`,
          });
        } else {
          res.status(400).json({
            Message: `Incorrect Credentials`,
          });
        }
      } else {
        res.status(400).json({ Message: "You are not our registered user" });
        return;
      }
    });
  } else {
    res.status(400).json({
      Message: "Type should be 'admin' or 'coustomer' (lowercase)",
    });
    return;
  }
};
// coustomer related APIs


// Admin Related APIs
