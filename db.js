const mongoose = require("mongoose");

const tweetSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    maxLength: 280,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

userSchema.methods.follow = function (userId) {
  if (!this.following.includes(userId)) {
    this.following.push(userId);
  }
  return this.save();
};

userSchema.methods.unfollow = function (userId) {
  this.following.pull(userId);
  return this.save();
};

const Tweet = mongoose.model("Tweet", tweetSchema);
const User = mongoose.model("User", userSchema);

module.exports = {
  Tweet,
  User,
};
