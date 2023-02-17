const express = require("express");
const router = express.Router();
const userController = require("../controller/userController");
const taskController = require("../controller/taskController");
const middleware = require("../middleware/auth.js");

// UserModel APIs
router.post("/register", userController.register);
router.post("/Login", userController.login);
router.get(
  "/user/:userId/profile",
  middleware.auth,
  userController.getUserDetails
);
router.put("/user/:userId/profile", middleware.auth, userController.updateUser);

// TaskModel APIs
router.get("/tasks", taskController.getAllTasks);
router.get("/tasks/:id", taskController.getTaskById);
router.get("/tasks/:userId", taskController.getTasksByUserId);
router.post("/tasks", taskController.insertTask);
router.put("/tasks/:id", taskController.updateTask);
router.delete("/tasks/:id", taskController.deleteTask);

// if api is invalid OR wrong URL
router.all("/**", function (req, res) {
  res.status(404).send({
    status: false,
    msg: "Invalid URL",
  });
});

module.exports = router;
