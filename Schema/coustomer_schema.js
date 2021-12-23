const mongoose = require("mongoose");
const schma = mongoose.Schema;
const bcrypt = require("bcryptjs");

const coustomer = new schma({
  fullname: {
    type: String,
    required: [true, "Please add a firstname"],
  },
  email: {
    type: String,
    required: [true, "Please add a firstname"],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please fill a valid email address",
    ],
  },
  password: {
    type: String,
    required: [true, "Please add password"],
  },
  Shipping_Address: {
    Address: { type: String },
    City: { type: String },
    ZipCode: { type: String },
    Country: { type: String },
  },
});


// password hashing before saving bycrypt code
coustomer.pre("save", function (next) {
  const user = this;
  if (this.isModified("password") || this.isNew) {
    bcrypt.genSalt(10, function (saltError, salt) {
      //by default salt
      if (saltError) {
        return next(saltError);
      } else {
        bcrypt.hash(user.password, salt, function (hashError, hash) {
          if (hashError) {
            return next(hashError);
          }
          user.password = hash;
          next();
        });
      }
    });
  } else {
    return next();
  }
});
module.exports = mongoose.model("coustomer", coustomer);
