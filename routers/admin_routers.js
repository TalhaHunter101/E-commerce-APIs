const express = require("express");
const router = express.Router();
const userController = require("../Controller/Users_controller");
const adminController = require("../Controller/admin_controller");
const auth = require("../middleware/auth");
router.use(
  express.urlencoded({
    extended: true,
  })
);

//routing User  to controller
router.post("/addcategory", auth, adminController.Ccategory);
router.post("/add_Products", auth, adminController.add_product);
router.get("/viewallcoustomer", auth, adminController.viewCoustomers);
router.get("/viewallproducts", auth, adminController.viewProducts);
router.get("/finalizeorderadmin", auth, adminController.finalizeorderadmin);
router.get("/viewalloders", auth, adminController.viewalloders);

module.exports = router;
