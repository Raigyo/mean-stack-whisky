const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const argon2 = require("argon2");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: [true, "User already exists."],
  },
  password: { type: String, required: true },
  status: { type: String, required: true },
  createdOn: { type: Date, default: Date.now },
});

userSchema.plugin(uniqueValidator);

userSchema.methods.validPassword = async function (password) {
  return await argon2.verify(this.password, password); // argon2.verify("<big long hash>", "password")
};

userSchema.pre("save", async function (next) {
  console.log("inside pre");
  if (this.password) {
    console.log("this.password", this.password);
    this.password = await argon2.hash(this.password);
  }
  next();
});

module.exports = mongoose.model("User", userSchema);
