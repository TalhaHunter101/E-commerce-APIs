const mongoose = require("mongoose");
const schma = mongoose.Schema;

const order = new schma({
  Cemail: { type: String },
  Cname: { type: String },
  Products: [{ type: schma.Types.ObjectId, ref: "products" }],
  total: { type: Number },
  ShippingAddress: { type: String },
  paymentstatus: { type: String, default: ": : : : Cash on delivery : : : : " },
  Status: { type: String, default: "awaiting" }, // awaiting or shipped
});

module.exports = mongoose.model("Order", order);
