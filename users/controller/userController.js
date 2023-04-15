const express = require("express");
const User = require("../model/User");
const jwt = require("jsonwebtoken");
const { createUser, generateSixDigitOtp, sendError } = require("./userHelper");
module.exports = {
  login: async (req, res) => {
    try {
      const { name, email, password } = req.body;
      console.log(name, email, password);

      if (!name || !password) {
        throw new Error(message, "please include username and password");
      }
      if (name && password) {
        res.status(200).json({
          message: `your username ${name},${email}is acceptable and password ${password}`,
        });
      }
    } catch (error) {
      res.status(400).json({ error: error });
    }
  },
  create: async (req, res) => {
    try {
      const { username, email, password } = req.body;
      console.log(username, email, password, "here on userController create");

      const oldUser = await User.findOne({ email });
      if (oldUser) {
        return res
          .status(401)

          .json({ error: `this ${email} already has a account` });
      }

      let newUser = await createUser(req.body);
      console.log("testing before");

      generateSixDigitOtp(newUser);

      console.log("testing after");

      await newUser.save();

      res.status(200).json({
        message: `${newUser.username} has be added to database,Please verify you email. OTP has been sent to your email account!`,
      });
    } catch (error) {
      console.log(error);
    }
  },
  signIn: async (req, res) => {
    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email });
      if (!user) {
        return sendError(res, "Email/Password does not match");
      }
      const matched = await user.comparePassword(password);
      console.log(password,'line 61')
      if (!matched) {
        return sendError(res, "email/password does not match/password");
      }
      const { _id, username } = user;
      const jwtToken = jwt.sign(
        {
          userId: _id,
        },
        "fdsasdfjklghjkjhgasdf"
      );
      res.json({ user: { id: _id, username, email, token: jwtToken } });
    } catch (error) {
      console.log(error);
    }
  },
};
