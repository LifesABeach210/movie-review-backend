const { check, validationResult } = require("express-validator");
exports.userValidator = [
  check("username").trim().not().isEmpty().withMessage("Name is missing"),
  check("email")
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage("Email is invalid"),
  check("password")
    .trim()
    .not()
    .isEmpty()
    .withMessage("Password is missing")
    .isLength({ min: 8, max: 20 })
    .withMessage("password must be between 8 and 20 chars long"),
];

exports.validateSignIn = [
  check("email")
    .normalizeEmail()
    .trim()
    .isEmail()
    .withMessage("Email is invalid"),
  check("password").trim().not().isEmpty().withMessage("Password is missing"),
];
exports.validatePassword = [
  check("newPassword")
    .trim()
    .not()
    .isEmpty()
    .withMessage("Password is missing")
    .isLength({ min: 8, max: 20 })
    .withMessage("password must be between 8 and 20 chars long"),
];
exports.validate = (req, res, next) => {
  const error = validationResult(req).array();
  console.log(error);
  if (error.length) {
    return res.json({ error: error[0].msg });
  }

  next();
};
