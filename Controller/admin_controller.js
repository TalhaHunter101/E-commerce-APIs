const coustomer = require("../Schema/coustomer_schema");
const product = require("../Schema/product.schema");
const CSchema = require("../Schema/categories.schema");
const order = require("../Schema/order_Schema");

const dotenv = require("dotenv");
var express = require("express");
var jwt = require("jsonwebtoken");
var app = express();
dotenv.config();
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.json());

// exports.addProduct = async (req, res, next) =>{

// Category Controllers
const buildAncestors = async (id, parent_id) => {
  let ancest = [];
  try {
    let parent_category = await Category.findOne(
      { _id: parent_id },
      { name: 1, slug: 1, ancestors: 1 }
    ).exec();

    if (parent_category) {
      const { _id, name, slug } = parent_category;
      const ancest = [...parent_category.ancestors];
      ancest.unshift({ _id, name, slug });
      await Category.findByIdAndUpdate(id, {
        $set: { ancestors: ancest },
      });
    }
  } catch (err) {
    console.log(err.message);
  }
};

exports.Ccategory = async (req, res, next) => {
  if (req.body.name == "" || req.body.name == undefined) {
    res.status(400).send({ Message: "Missing Name :: Enter again" });
  } else {
    let parent = req.body.parent ? req.body.parent : null;
    const category = new Category({ name: req.body.name, parent });
    try {
      let newCategory = await category.save();
      buildAncestors(newCategory._id, parent);
      res.status(201).send({ response: newCategory });
    } catch (err) {
      res.status(500).send(err);
    }
  }
};
/// product  Controllers
exports.add_product = async (req, res, next) => {
  if (req.body.title == "" || req.body.title == undefined) {
    res.status(400).json({ Message: "Missing title: try Again" });
    return;
  } else if (req.body.description == "" || req.body.description == undefined) {
    res.status(400).json({ Message: "Missing discription:: Try again" });
    return;
  } else if (req.body.category == "" || req.body.category == undefined) {
    res.status(400).json({ Message: "Missing category:: Try again" });
    return;
  } else if (req.body.quantity == "" || req.body.quantity == undefined) {
    res.status(400).json({ Message: "Missing quantity :: Enter again" });
    return;
  } else if (req.body.price == "" || req.body.price == undefined) {
    res.status(400).json({ Message: "Missing price :: Enter again" });
    return;
  } else if (req.body.brand == "" || req.body.brand == undefined) {
    res.status(400).json({ Message: "Missing brand:: Try again" });
    return;
  } else if (
    req.body.OperatingSystem == "" ||
    req.body.OperatingSystem == undefined
  ) {
    res.status(400).json({ Message: "OperatingSystem missing :: Enter again" });
    return;
  } else if (req.body.ram == "" || req.body.ram == undefined) {
    res.status(400).json({ Message: "Missing RAM :: Enter again" });
    return;
  } else if (req.body.Memory == "" || req.body.Memory == undefined) {
    res.status(400).json({ Message: "Missing Memory :: Enter again" });
    return;
  } else if (req.body.Color == "" || req.body.Color == undefined) {
    res.status(400).json({ Message: "Missing Color:: Try again" });
    return;
  } else if (req.body.Warranty == "" || req.body.Warranty == undefined) {
    res.status(400).json({ Message: "Warranty missing :: Enter again" });
    return;
  } else if (req.body.Camera == "" || req.body.Camera == undefined) {
    res.status(400).json({ Message: "Missing Camera :: Enter again" });
    return;
  } else if (req.body.Dual_sim == "" || req.body.Dual_sim == undefined) {
    res.status(400).json({ Message: "Missing Dual_sim :: Enter again" });
    return;
  } else if (req.user.U_type == "admin") {
    CSchema.findOne({ name: req.body.category }, (err, cfind) => {
      if (!cfind) {
        // console.log("category not present in the schema new created");
        let parent = req.body.parent ? req.body.parent : null;
        const category = new CSchema({ name: req.body.category, parent });
        try {
          let newCategory = category.save();
          buildAncestors(newCategory._id, parent);
        } catch (err) {
          res.status(500).send(err);
        }
      } else {
        // console.log("category already present");
      }
    });
    if (req.body.Shipping_fee) {
      let newproduct = new product({
        title: req.body.title,
        discription: req.body.discription,
        category: req.body.category,
        quantity: req.body.quantity,
        pricing: { price: req.body.price, Shipping_fee: req.body.Shipping_fee },
        Specifications: {
          Brand: req.body.brand,
          Operating_System: req.body.OperatingSystem,
          RAM: req.body.ram,
          Memory: req.body.Memory,
          Color: req.body.Color,
          Warranty: req.body.Warranty,
          Camera: req.body.Camera,
          Dual_sim: req.body.Dual_sim,
        },
      });
      newproduct.save();
      res.status(400).json({ Message: "Product Saved" });
      return;
    } else {
      let newproduct = new product({
        title: req.body.title,
        discription: req.body.discription,
        category: req.body.category,
        quantity: req.body.quantity,
        pricing: { price: req.body.price },
        Specifications: {
          Brand: req.body.brand,
          Operating_System: req.body.OperatingSystem,
          RAM: req.body.ram,
          Memory: req.body.Memory,
          Color: req.body.Color,
          Warranty: req.body.Warranty,
          Camera: req.body.Camera,
          Dual_sim: req.body.Dual_sim,
        },
      });
      newproduct.save();
      res.status(400).json({ Message: "Product Saved" });
      return;
    }
  } else {
    res
      .status(400)
      .json({ Message: "You are not autherized to app the product" });
    return;
  }
};

exports.viewCoustomers = async (req, res) => {
  if (req.user.U_type == "admin") {
    coustomer.find({}, (err, find) => {
      if (find && find != "") {
        res.status(200).json({ message: "Your coustomers are: ", data: find });
      } else {
        res.status(404).json({ Message: "You don't have any coustomers." });
      }
    });
  } else {
    res
      .status(400)
      .json({ Message: "You are not autherized for this request" });
  }
};

exports.viewProducts = async (req, res) => {
  if (req.user.U_type == "admin") {
    product.find({}, (err, find) => {
      if (find && find != "") {
        res.status(200).json({ message: "Your Products are: ", data: find });
      } else {
        res.status(404).json({ Message: "You don't have any products." });
      }
    });
  } else {
    res
      .status(400)
      .json({ Message: "You are not autherized for this request" });
  }
};

exports.finalizeorderadmin = async (req, res, next) => {
  if (req.body.order_id == "" || req.body.order_id == undefined) {
    res.status(400).json({ Message: "Missing order details" });
    return;
  } else {
    if (req.user.U_type == "admin") {
      order.findOneAndUpdate(
        { _id: req.body.order_id },
        { Status: "Order Dispatched" },
        (err, ofind) => {
          if (ofind) {
            if (req.body.payment) {
              ofind.paymentstatus = req.body.payment;
              ofind.save();
            }
            res.status(200).send({ Message: "Your order is dispatched" });
          } else {
            res.status(404).send({ Message: "You cart not found" });
          }
        }
      );
    } else {
      res.status(400).json({ Message: "You are not our coustomer" });
      return;
    }
  }
};

exports.viewalloders = async (req, res, next) => {
  order.find({}, (err, ffind) => {
    if (ffind) {
      return res
        .status(200)
        .json({ Message: "Orders found are: ", Data: ffind });
    } else {
      return res.status(404).json({ Message: "No orderd found" });
    }
  });
};
