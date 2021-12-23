const express = require("express");
const router = express.Router();
const userController = require("../Controller/Users_controller");
const auth = require("../middleware/auth");
const coustomercontroller = require("../Controller/coustomer_controller");
router.use(
  express.urlencoded({
    extended: true,
  })
);

//routing User  to controller
router.post("/signup", userController.signup);
// generating token
// router.put("/resetPass", userController.reset_pass);
// router.get("/ForgetPass", userController.forget_pass);
router.post("/login", userController.login);
router.post("/add_address", auth, coustomercontroller.add_address);
router.post("/place_order", auth, coustomercontroller.placeorder);
router.post("/finalizeorder", auth, coustomercontroller.finalizeorderPayment);
router.get("/viewyourorders", auth, coustomercontroller.viewyourorders);
// generating token

router.get("/findproducts", auth, coustomercontroller.findproducts);
router.post("/addreview", auth, coustomercontroller.addReview);
router.get("/addreply_toreview", auth, coustomercontroller.addReply_toreview);

module.exports = router;
