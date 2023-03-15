const express = require("express");
const router = express.Router();
const userController = require("../controller/userController");
const taskController = require("../controller/taskController");
const roomController = require("../controller/roomController");

// UserModel APIs
router.post("/api/loginByOAuth", userController.loginByOAuth);
router.post("/api/changeUserCoins", userController.changeUserCoins);
router.get("/api/OAuthUsers", userController.getOAuthUsers);
router.put("/api/OAuthUsers/:userId", userController.updateOAuthUsers);
router.get("/api/OAuthUsers/:userId", userController.getOAuthUserById);
router.delete("/api/OAuthUsers/:userId", userController.deleteOauthUser);

// TaskModel APIs
router.get("/api/tasks", taskController.getAllTasks);
router.get("/api/tasks/:id", taskController.getTaskById);
router.get("/api/tasks/:userId", taskController.getTasksByUserId);
router.post("/api/tasks", taskController.insertTask);
router.post("/api/tasks/bulk", taskController.insertTaskBulk);
router.put("/api/tasks/:id", taskController.updateTask);
router.delete("/api/tasks/:id", taskController.deleteTask);
router.delete("/api/tasks/all", taskController.deleteTaskBulk);

// RoomModel APIs
router.get("/api/rooms", roomController.getAllRooms);
router.post("/api/room/create", roomController.createRoom);
router.get("/api/room/:roomId", roomController.getRoomById);
router.delete("/api/room/:roomId", roomController.deleteRoom);

// if api is invalid OR wrong URL
router.all("/**", function (req, res) {
  res.status(404).send({
    status: false,
    msg: "Invalid URL",
  });
});

module.exports = router;
