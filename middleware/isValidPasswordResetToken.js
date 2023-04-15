const passwordResetToken = require("../users/model/passwordResetTokenSchema");
const { sendError } = require("../users/controller/userHelper");
const { isValidObjectId } = require("mongoose");
const { reset } = require("nodemon");

const isValidPasswordResetToken = async (req, res, next) => {
  const { token, userId } = req.body;

  if (!token.trim() || !isValidObjectId(userId)) {
    return sendError(res, "invalid request--hello");
  }

  const resetToken = await passwordResetToken.findOne({ owner: userId });
  if (!resetToken) {
    return sendError(res, "Unauthorized acess, invalid request.2.0");
  }
  const matched = await resetToken.comparePassword(token);
  if (!matched) {
    return sendError(res, "invalid request");
  }
  req.resetToken = matched;
  next();
};

module.exports = { isValidPasswordResetToken };
