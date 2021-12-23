const mongoose = require("mongoose");
const schma = mongoose.Schema;
const products = new schma({
  title: { type: String },
  description: { type: String },
  category: { type: String },
  quantity: { type: Number },

  pricing: {
    price: { type: Number },
    Shipping_fee: { type: Number, default: 100 },
  },
  //schma.Types.ObjectId, ref: "brands"
  Specifications: {
    Brand: { type: String },
    Operating_System: { type: String },
    RAM: { type: String },
    Memory: { type: String },
    Color: { type: String },
    Warranty: { type: String },
    Camera: { type: String },
    Dual_sim: { type: Boolean },
  },
  Reviews: [
    {
      email: { type: String },
      review: { type: String },
      reply: [
        {
          email: { type: String },
          review: { type: String },
        },
      ],
    },
  ],
});
module.exports = mongoose.model("products", products);
