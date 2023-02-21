const express = require("express");
const router = express.Router();
const userController = require("../controller/userController");
const taskController = require("../controller/taskController");
const middleware = require("../middleware/auth.js");

// UserModel APIs
router.post("/api/register", userController.register);
// router.post("/api/Login", userController.login);
router.post("/api/loginByOAuth", userController.loginByOAuth);
router.get(
  "/api/user/:userId/profile",
  middleware.auth,
  userController.getUserDetails
);
router.put(
  "/api/user/:userId/profile",
  middleware.auth,
  userController.updateUser
);

// TaskModel APIs
router.get("/api/tasks", taskController.getAllTasks);
router.get("/api/tasks/:id", taskController.getTaskById);
router.get("/api/tasks/:userId", taskController.getTasksByUserId);
router.post("/api/tasks", taskController.insertTask);
router.put("/api/tasks/:id", taskController.updateTask);
router.delete("/api/tasks/:id", taskController.deleteTask);

// if api is invalid OR wrong URL
router.all("/**", function (req, res) {
  res.status(404).send({
    status: false,
    msg: "Invalid URL",
  });
});

module.exports = router;
