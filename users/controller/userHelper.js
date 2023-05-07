const { req } = require("express/lib/request");
const User = require("../model/User");
const crypto = require("crypto");
var emailVerifactionToken = require("../model/emailVerifactionToken");
var passwordResetToken = require("../model/passwordResetTokenSchema");
var { generateMailTransporter } = require("../../utils/mail");
const bcrypt = require("bcrypt");
const res = require("response");
var nodemailer = require("nodemailer");
const { isValidObjectId } = require("mongoose");
const saltround = 10;

const createUser = async (user) => {
  const newUser = await new User({
    username: user.username,
    email: user.email,
    password: user.password,
  });
  return newUser;
};

const generateRandomByte = () => {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(12, (err, buff) => {
      if (err) {
        reject(err);
      }
      const bufferString = buff.toString("hex");
      console.log(bufferString);
      resolve(bufferString);
    });
  });
};

const forgetPassword = async (req, res) => {
  const { email } = req.body;
  try {
    if (!email) {
      return sendError(res, "email is missing");
    }

    const user = await User.findOne({ email });

    if (!user) {
      return sendError(res, "User not found", 404);
    }

    const alreadHasToken = await passwordResetToken.findOne({
      owner: user._id,
    });

    if (alreadHasToken) {
      return sendError(res, "only after one hour can u request a new token");
    }
    const token = await generateRandomByte();

    const newPasswordTokenReset = await passwordResetToken({
      owner: user._id,
      token,
    });

    newPasswordTokenReset.save();

    const resetPasswordUrl = `http://localhost:3000/resetpassword?token=${token}&id=${user._id}`;

    var transport = generateMailTransporter();

    transport.sendMail({
      from: "security@reviewapp.com",
      to: user.email,
      subject: "Reset Password Link",
      html: `
      <p>Click here to reset password</p>
      <a href='${resetPasswordUrl}'>Change Password</a>
    `,
    });

    res.json({ message: "Link sent to your email!" });
  } catch (error) {
    sendError(res, error.toString(), 400);
  }
};

const sendError = (res, errorMessage, statusCode = 401) => {
  res.status(statusCode).json({ error: errorMessage });
};

const generateSixDigitOtp = async (newUser) => {
  let OTP = "";
  for (let i = 0; i <= 5; i++) {
    const randomVal = Math.round(Math.random() * 9);
    OTP += randomVal;
  }
  const newEmailVerifcationToken = new emailVerifactionToken({
    owner: newUser._id,
    token: OTP,
  });

  await newEmailVerifcationToken.save();
  let setFlag = true;
  var transport = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "898e35f55f229c",
      pass: "08b128f496ae9c",
    },
  });

  transport.sendMail({
    from: "verification@reviewapp.com",
    to: newUser.email,
    subject: "Email Verification",
    html: `<p>Your verifcation token</p>
        
        <h1>${OTP}</h1>`,
  });

  return setFlag;
};

const verifyEmail = async (req, res) => {
  const { userId, otp } = req.body;
  console.log(req.body);
  const Alphaotp = otp.split(",").join("");
  console.log(Alphaotp);
  try {
    console.log("hit");
    // if (!isValidObjectId(userId)) {
    //   console.log("route 127 hit");
    //   return sendError(res, "user not found");
    // }

    const user = await User.findById(userId);
    console.log(user);
    if (!user) {
      return sendError(res, "user not found");
    }
    if (user.isVerified) {
      return sendError(res, "user is already verified");
    }

    const token = await emailVerifactionToken.findOne({ owner: userId });
    console.log(token);
    if (!token) {
      return sendError(res, "token not found");
    }
    const testToken = token.token;
    const isMatched = await bcrypt.compare(Alphaotp, testToken);
    console.log(isMatched);
    if (!isMatched) {
      return sendError(res, "please submit a valid OTP");
    }

    user.isVerified = true;

    await user.save();

    await emailVerifactionToken.findByIdAndDelete(token._id);
    var transport = nodemailer.createTransport({
      host: "sandbox.smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: "898e35f55f229c",
        pass: "08b128f496ae9c",
      },
    });

    transport.sendMail({
      from: "verification@reviewapp.com",
      to: user.email,
      subject: "Welcome Email",
      html: `<p>Your verifcation token</p>
    
    <h1>$Welcome to our app!!</h1>`,
    });

    res.json({
      message: "your email is verified",
      user: { isVerified: user.isVerified, userName: user.username },
    });
  } catch (error) {
    sendError(res, error.toString(), 400);
  }
};

const resendEmailVerifcation = async (req, res) => {
  const { userId } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return sendError(res, "user not found");
    }
    if (user.isVerified) {
      return sendError(res, "this email id is already verified");
    }
    const alreadHasToken = await emailVerifactionToken.findOne({
      owner: userId,
    });
    if (alreadHasToken) {
      return sendError(
        res,
        "only after one hour you can request another token!"
      );
    }
    await generateSixDigitOtp(user);

    return sendError(res, "new token", 200);
  } catch (error) {
    sendError(res, error.toString(), 400);
  }
};

const sendResetPasswordTokenStatus = (req, res) => {
  res.json({ valid: true });
};

const resetPassword = async (req, res) => {
  const { newPassword, userId } = req.body;

  try {
    const user = await User.findById(userId);
    const matchedPassword = await user.comparePassword(newPassword);
    if (matchedPassword) {
      return sendError(
        res,
        "The new password must be different from the old one?"
      );
    }
    user.password = newPassword;
    await user.save();
    const userPassToken = await passwordResetToken.findOne({ owner: userId });
    if (userPassToken) {
      await passwordResetToken.findByIdAndDelete(req.resetToken._id);
    }

    console.log("here at line 204 userhelper");
    const transport = generateMailTransporter();

    transport.sendMail({
      from: "security@reviewapp.com",
      to: user.email,
      subject: "Passowrd reset Successfully",
      html: `
      <h1>Click here to reset password</h1>
      <p>Now you can use new password</p>
    `,
    });

    return res.json({ message: "Password has been reset successfully." });
  } catch (error) {
    sendError(res, error.toString(), 400);
  }
};
module.exports = {
  createUser,
  generateSixDigitOtp,
  verifyEmail,
  resendEmailVerifcation,
  sendError,
  forgetPassword,
  sendResetPasswordTokenStatus,
  resetPassword,
};
