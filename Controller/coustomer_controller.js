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

exports.add_address = async (req, res, next) => {
  console.log(req.user);
  if (req.body.Address == "" || req.body.Address == undefined) {
    res.status(400).json({ Message: "Street Address missing :: Enter Again" });
  } else if (req.body.City == "" || req.body.City == undefined) {
    res.status(400).json({ Message: "City missing :: Enter Again" });
  } else if (req.body.ZipCode == "" || req.body.ZipCode == undefined) {
    res.status(400).json({ Message: "ZipCode missing :: Enter Again" });
  } else if (req.body.ZipCode.length != 4) {
    res.status(400).json({ Message: "Zip code should be 4 numbers" });
  } else if (req.body.Country == "" || req.body.Country == undefined) {
    res.status(400).json({ Message: "Country missing :: Enter Again" });
  } else if (req.user.U_type == "coustomer") {
    coustomer.findOne({ _id: req.user.user_id }, (err, find) => {
      if (find) {
        find.Shipping_Address.Address = req.body.Address;
        find.Shipping_Address.City = req.body.City;
        find.Shipping_Address.ZipCode = req.body.ZipCode;
        find.Shipping_Address.Country = req.body.Country;
        find.save();
        res
          .status(200)
          .json({ Message: "Address Added to the coustomer profile" });
      } else {
        res.status(400).json({ Message: "No coustomer found" });
      }
    });
  } else {
    res.status(400).json({ Message: "You are not our coustomer" });
  }
};

exports.placeorder = async (req, res, next) => {
  if (req.body.p_id == "" || req.body.p_id == undefined) {
    res.status(400).json({ Message: "Missing product Id ::: " });
  } else if (req.body.quantity == "" || req.body.quantity == undefined) {
    res.status(400).json({ Message: "Missing quantity ::: " });
  } else {
    if (req.user.U_type == "coustomer") {
      coustomer.findById({ _id: req.user.user_id }, (err, cous) => {
        if (!cous.Shipping_Address) {
          res.status(400).json({ message: "Shipping address not provided" });
        } else {
          product.findOneAndUpdate(
            { _id: req.body.p_id, quantity: { $gte: req.body.quantity } },
            { $inc: { quantity: -req.body.quantity } },
            (err, pfind) => {
              if (!pfind) {
                res.status(400).json({
                  Message:
                    "Product not found or else your required category is out of stock",
                });
                return;
              } else {
                console.log(pfind);
                order.findOne(
                  { Cemail: req.user.emil, Status: "awaiting" },
                  (err, find) => {
                    var total = pfind.pricing.price * req.body.quantity;
                    total += pfind.pricing.Shipping_fee;
                    if (find) {
                      find.Products.push(pfind._id);
                      find.total += total;
                      find.save();
                      res.status(200).json({
                        Message: "Product added to your current order",
                      });
                    } else {
                      let neworder = new order({
                        Cemail: req.user.emil,
                        Cname: cous.fullname,
                        Products: pfind._id,
                        total: total,
                        ShippingAddress:
                          cous.Shipping_Address.Address +
                          ", " +
                          cous.Shipping_Address.City +
                          ", " +
                          cous.Shipping_Address.ZipCode +
                          ", " +
                          cous.Shipping_Address.Country,
                      });
                      neworder.save();
                      res.status(200).json({
                        Message: "Order created and product added ",
                      });
                    }
                  }
                );
              }
            }
          );
        }
      });
    } else {
      res.status(400).json({ Message: "You are not our coustomer" });
      return;
    }
  }
};

exports.finalizeorderPayment = async (req, res) => {
  if (req.body.order_id == "" || req.body.order_id == undefined) {
    res.status(400).json({ Message: "Missing order details" });
    return;
  } else {
    if (req.user.U_type == "coustomer") {
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

exports.viewyourorders = async (req, res, next) => {
  if (req.user.U_type == "coustomer") {
    order.find({}, (err, ofind) => {
      if (ofind && ofind != "") {
        res.status(200).json({ Message: "Your order found", Data: ofind });
      } else {
        res.status(400).json({ Message: "Your order not found" });
      }
    });
  } else {
    res.status(400).json({ Message: "You are not our coustomers" });
  }
};

exports.findproducts = async (req, res, next) => {
  if (req.body.start_price && !req.body.end_price) {
    res
      .status(400)
      .json({ Message: "Start and End date should both be provided." });
    return;
  } else if (!req.body.start_price && req.body.end_price) {
    res
      .status(400)
      .json({ Message: "Start and End date should both be provided." });
    return;
  }

  if (
    !req.body.title &&
    !req.body.category &&
    !req.body.start_price &&
    !req.body.end_price &&
    !req.body.brand &&
    !req.body.ram &&
    !req.body.memory &&
    !req.body.color &&
    !req.body.camera &&
    !req.body.dual_sim
  ) {
    // no query arguments all products
    product.find({}, (err, find) => {
      if (find && find != "") {
        res.status(200).json({ Message: "Product found", Data: find });
      } else {
        res.status(404).json({ Message: "Product not found" });
      }
    });
  } else if (
    req.body.title &&
    !req.body.category &&
    !req.body.start_price &&
    !req.body.end_price &&
    !req.body.brand &&
    !req.body.ram &&
    !req.body.memory &&
    !req.body.color &&
    !req.body.camera &&
    !req.body.dual_sim
  ) {
    product.find(
      { title: { $regex: new RegExp(req.body.title, "i") } },
      (err, find) => {
        if (find && find != "") {
          res.status(200).json({ Message: "Product found", Data: find });
        } else {
          res.status(404).json({ Message: "Product not found" });
        }
      }
    );
  } else if (
    !req.body.title &&
    req.body.category &&
    !req.body.start_price &&
    !req.body.end_price &&
    !req.body.brand &&
    !req.body.ram &&
    !req.body.memory &&
    !req.body.color &&
    !req.body.camera &&
    !req.body.dual_sim
  ) {
    product.find(
      { category: { $regex: new RegExp(req.body.category, "i") } },
      (err, find) => {
        if (find && find != "") {
          res.status(200).json({ Message: "Product found", Data: find });
        } else {
          res.status(404).json({ Message: "Product not found" });
        }
      }
    );
  } else if (
    !req.body.title &&
    !req.body.category &&
    !req.body.start_price &&
    !req.body.end_price &&
    req.body.brand &&
    !req.body.ram &&
    !req.body.memory &&
    !req.body.color &&
    !req.body.camera &&
    !req.body.dual_sim
  ) {
    product.find(
      {
        "Specifications.Brand": { $regex: new RegExp(req.body.brand, "i") },
      },
      (err, find) => {
        if (find && find != "") {
          res.status(200).json({ Message: "Product found", Data: find });
        } else {
          res.status(404).json({ Message: "Product not found" });
        }
      }
    );
  } else if (
    !req.body.title &&
    !req.body.category &&
    !req.body.start_price &&
    !req.body.end_price &&
    !req.body.brand &&
    req.body.ram &&
    !req.body.memory &&
    !req.body.color &&
    !req.body.camera &&
    !req.body.dual_sim
  ) {
    product.find({ "Specifications.RAM": req.body.ram }, (err, find) => {
      if (find && find != "") {
        res.status(200).json({ Message: "Product found", Data: find });
      } else {
        res.status(404).json({ Message: "Product not found" });
      }
    });
  } else if (
    !req.body.title &&
    !req.body.category &&
    !req.body.start_price &&
    !req.body.end_price &&
    !req.body.brand &&
    !req.body.ram &&
    req.body.memory &&
    !req.body.color &&
    !req.body.camera &&
    !req.body.dual_sim
  ) {
    product.find({ "Specifications.Memory": req.body.memory }, (err, find) => {
      if (find && find != "") {
        res.status(200).json({ Message: "Product found", Data: find });
      } else {
        res.status(404).json({ Message: "Product not found" });
      }
    });
  } else if (
    !req.body.title &&
    !req.body.category &&
    !req.body.start_price &&
    !req.body.end_price &&
    !req.body.brand &&
    !req.body.ram &&
    !req.body.memory &&
    req.body.color &&
    !req.body.camera &&
    !req.body.dual_sim
  ) {
    product.find({ "Specifications.Color": req.body.color }, (err, find) => {
      if (find && find != "") {
        res.status(200).json({ Message: "Product found", Data: find });
      } else {
        res.status(404).json({ Message: "Product not found" });
      }
    });
  } else if (
    !req.body.title &&
    !req.body.category &&
    !req.body.start_price &&
    !req.body.end_price &&
    !req.body.brand &&
    !req.body.ram &&
    !req.body.memory &&
    !req.body.color &&
    req.body.camera &&
    !req.body.dual_sim
  ) {
    product.find({ "Specifications.Camera": req.body.camera }, (err, find) => {
      if (find && find != "") {
        res.status(200).json({ Message: "Product found", Data: find });
      } else {
        res.status(404).json({ Message: "Product not found" });
      }
    });
  } else if (
    !req.body.title &&
    !req.body.category &&
    !req.body.start_price &&
    !req.body.end_price &&
    !req.body.brand &&
    !req.body.ram &&
    !req.body.memory &&
    !req.body.color &&
    !req.body.camera &&
    req.body.dual_sim
  ) {
    product.find(
      { Specifications: { "Specifications.Dual_sim": req.body.dual_sim } },
      (err, find) => {
        if (find && find != "") {
          res.status(200).json({ Message: "Product found", Data: find });
        } else {
          res.status(404).json({ Message: "Product not found" });
        }
      }
    );
  } else if (
    !req.body.title &&
    !req.body.category &&
    req.body.start_price &&
    req.body.end_price &&
    !req.body.brand &&
    !req.body.ram &&
    !req.body.memory &&
    !req.body.color &&
    !req.body.camera &&
    !req.body.dual_sim
  ) {
    console.log("i am price only");
    product.find(
      {
        "pricing.price": { $gt: req.body.start_price, $lt: req.body.end_price },
      },
      (err, find) => {
        if (find && find != "") {
          res.status(200).json({ Message: "Product found", Data: find });
        } else {
          res.status(404).json({ Message: "Product not found" });
        }
      }
    );
  }
};

exports.addReview = async (req, res) => {
  order.findOne({ Cemail: req.user.emil }, (err, docx) => {
    if (docx) {
      console.log(docx);
      product.findOne({ _id: req.body.p_id }, (err, find) => {
        if (find) {
          find.Reviews.push({
            email: req.user.emil,
            review: req.body.review,
          });
          find.save();

          res.status(200).send({ Message: "Product review added" });
        } else {
          res.status(400).send({ Message: "No product found" });
        }
      });
    } else {
      res.status(400).send({ Message: "No order placed yet" });
    }
  });
};

exports.addReply_toreview = async (req, res) => {
  if (req.body.p_id == "" || req.body.p_id == undefined) {
    res.status(400).json({ Message: "Product Id Missing :: Enter Again" });
  } else if (req.body.r_id == "" || req.body.r_id == undefined) {
    res.status(400).json({ Message: "review Id Missing :: Enter Again" });
  } else {
    product.findOne({ _id: req.body.p_id }, (err, find) => {
      if (find) {
        for (var i = 0; i < find.Reviews.length; i++) {
          if (find.Reviews[i]._id == req.body.r_id) {
            find.Reviews[i].reply.push({
              email: req.user.emil,
              review: req.body.review,
            });
            return res.status(200).json({ Message: "The reply review added " });
          }
        }
        res.send({
          Messgae: " Your selected review not found or deleted already",
        });
      } else {
        res.status(200).send({ Message: "Product not found with provided id" });
      }
    });
  }
};
