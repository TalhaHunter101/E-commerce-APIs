const mongoose = require("mongoose");
const schma = mongoose.Schema;

const brands = new schma({});
module.exports = mongoose.model("brands", brands);
