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

userSchema.pre("save", async function (next) {
  console.log("inside pre");
  if (this.password) {
    console.log("this.password", this.password);
    this.password = await argon2.hash(this.password);
  }
  next();
});

userSchema.methods.validPassword = async function (hash, password) {
  console.log("hash: ", hash);
  console.log("password: ", password);
  const result = await argon2.verify(hash, password);
  return result;
};

module.exports = mongoose.model("User", userSchema);
