const express = require("express");
const router = express.Router();
const userController = require("../controller/userController");
const middleware = require("../middleware/auth.js");

//UserModel APIs
router.post("/register", userController.register);
router.post("/Login", userController.login);
router.get(
  "/user/:userId/profile",
  middleware.auth,
  userController.getUserDetails
);
router.put("/user/:userId/profile", middleware.auth, userController.updateUser);

// if api is invalid OR wrong URL
router.all("/**", function (req, res) {
  res.status(404).send({
    status: false,
    msg: "please provide Id in params",
  });
});

module.exports = router;
