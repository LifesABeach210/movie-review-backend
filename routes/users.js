var express = require("express");
var router = express.Router();
var userController = require("../users/controller/userController");
const post = require("../users/model/post");
const {
  userValidtor,
  validate,
  validatePassword,
  signIn,
  createPost,
  getPost,
} = require("../middleware/validator");
const { create } = require("../users/controller/userController");
const {
  verifyEmail,
  resendEmailVerifcation,
  forgetPassword,
  sendResetPasswordTokenStatus,
  resetPassword,
} = require("../users/controller/userHelper");
const {
  isValidPasswordResetToken,
} = require("../middleware/isValidPasswordResetToken");
/* GET users listing. */

router.post("/create", function (req, res) {
  signIn, validate, userController.create(req, res);
});
router.post("/sign-in", function (req, res) {
  userValidtor, validate, userController.signIn(req, res);
});
router.post("/verify-email", function (req, res) {
  verifyEmail(req, res);
});
router.post("/resend-verification-token", function (req, res) {
  resendEmailVerifcation(req, res);
});
router.post("/forget-password", function (req, res) {
  forgetPassword(req, res);
});
router.post("/verify-reset-token", function (req, res, next) {
  isValidPasswordResetToken(req, res, next),
    sendResetPasswordTokenStatus(req, res);
});

router.post(
  "/reset-password",
  validatePassword,
  validate,
  isValidPasswordResetToken,
  resetPassword
);

router.getPost("/fetch-post", async (req, res) => {});

router.post("/createPost", async (req, res, next) => {
  userController.createPost(req, res);
});
module.exports = router;
