const express = require("express");
const User = require("../model/User");
const mongoosePost = require("../../users/model/post");
const jwt = require("jsonwebtoken");
const { uuid } = require("uuidv4");
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
        user: {
          id: newUser._id,
          username: newUser.username,
          email: newUser.email,
        },
        message: `${newUser.username} has be added to database,Please verify you email. OTP has been sent to your email account!`,
      });
    } catch (error) {
      console.log(error);
    }
  },
  signIn: async (req, res) => {
    const { email, password } = req.body;
    console.log(req.body);
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return sendError(res, "Email/Password does not match");
      }
      const matched = await user.comparePassword(password);
      console.log(password, "line 61");
      if (!matched) {
        return sendError(res, "email/password does not match/password");
      }
      console.log(user);
      const { _id, username, isVerified } = user;
      console.log(user);
      const jwtToken = jwt.sign(
        {
          userId: _id,
        },
        process.env.JWT_SECRET
      );
      console.log("send back ", jwtToken);
      res.json({ _id, username, email, jwtToken, isVerified });
    } catch (error) {
      console.log(error);
    }
  },
  createPost: async (req, res, next) => {
    const { firstname, lastname, Bio, userId, post } = req.body;
    console.log(req.body);
    const viewPost = await mongoosePost.find({});
    let count;
    const collectionLength = viewPost.map((_, i) => {
      count = i + 1;
      if (i === undefined) {
        count = 0;
      }
    });
    console.log(count);

    const newPost = {
      firstname: firstname,
      lastname: lastname,
      Bio: Bio,
      post: post,
      hasSubmited: true,
      userId: userId,
      date: new Date().toISOString(),
      id: count ? count : 0,
    };

    const createAPost = await mongoosePost.insertMany(newPost);
    if (createAPost === true) {
    }
    res.status(200).json({ message: "post created", data: newPost });
  },
  getPost: async (req, res, next) => {
    const { userId } = req.body;
    const viewPost = await mongoosePost.find({});
    console.log(viewPost);
    console.log(req.body);
    res.status(200).json({ data: viewPost });
  },
  editPost: async (req, res, next) => {
    const { userId, uuid, firstname, lastname, Bio, post } = req.body;
    console.log(req.body);
  },
  deletePost: async (req, res) => {
    const { postId } = req.body;
    console.log(req.params);
    console.log(postId);
    const results = await mongoosePost.deleteOne({ id: postId });
    if (results === true) {
      res.status(200).json({ message: "success" });
    } else {
      sendError(res, "Not Authorized");
    }
  },
};
