const express = require("express");
const router = express.Router();
const userController = require("../controller/userController");
const adminUserController = require("../controller/adminUserController");
const taskController = require("../controller/taskController");
const frTaskController = require("../controller/frTaskController");
const roomController = require("../controller/roomController");
const settingController = require("../controller/settingController");
const couponController = require("../controller/couponController");

// SettingModel APIs
router.get("/api/settings/:userId", settingController.getAllSettingsByUserId);

// AdminUserModel APIs
router.get("/api/adminUsers", adminUserController.getAdminUsers);
router.get("/api/adminUsers/:userId", adminUserController.getAdminUserById);
router.post("/api/adminUsers", adminUserController.addAdminUser);
router.delete("/api/adminUsers/:userId", adminUserController.deleteAdminUser);
router.put(
  "/api/adminUser-tasks/:userId",
  adminUserController.updateAdminUserTasks
);
router.put("/api/adminUser/:userId", adminUserController.updateAdminUser);
router.post(
  "/api/delete-adminUser-tasks",
  adminUserController.deleteAdminUserTasks
);
router.post("/api/login", adminUserController.adminLogin);

// UserModel APIs
router.post("/api/loginByOAuth", userController.loginByOAuth);
router.post("/api/changeUserCoins", userController.changeUserCoins);
router.get("/api/OAuthUsers", userController.getOAuthUsers);
router.put("/api/OAuthUsers/:userId", userController.updateOAuthUsers);
router.get("/api/OAuthUsers/:userId", userController.getOAuthUserById);
router.delete("/api/OAuthUsers/:userId", userController.deleteOauthUser);

// TaskModel APIs
router.get("/api/all-tasks", taskController.getAllLangTasks);
router.get("/api/tasks", taskController.getAllTasks);
router.get("/api/tasks/:id", taskController.getTaskById);
router.get("/api/user-tasks/:userId", taskController.getTasksByUserId);
router.post("/api/tasks", taskController.insertTask);
router.post("/api/tasks/bulk", taskController.insertTaskBulk);
router.put("/api/tasks/:id", taskController.updateTask);
router.delete("/api/tasks/:id", taskController.deleteTask);
router.delete("/api/tasks", taskController.deleteTaskBulk);

// Fr-TaskModel APIs
router.get("/api/fr-tasks", frTaskController.getAllTasks);
router.get("/api/fr-tasks/:id", frTaskController.getTaskById);
router.get("/api/fr-tasks/:userId", frTaskController.getTasksByUserId);
router.post("/api/fr-tasks", frTaskController.insertTask);
router.post("/api/fr-tasks/bulk", frTaskController.insertTaskBulk);
router.put("/api/fr-tasks/:id", frTaskController.updateTask);
router.delete("/api/fr-tasks/:id", frTaskController.deleteTask);
router.delete("/api/fr-tasks", frTaskController.deleteTaskBulk);

// RoomModel APIs
router.get("/api/rooms", roomController.getAllRooms);
router.post("/api/room/create", roomController.createRoom);
router.get("/api/room/:roomId", roomController.getRoomById);
router.delete("/api/room/:roomId", roomController.deleteRoom);

// CouponModel APIs
router.get("/api/coupons", couponController.getAllCoupons);
router.post("/api/coupon/create", couponController.insertCoupon);
router.post("/api/coupon/delete", couponController.deleteCoupon);
router.get(
  "/api/updateCouponUsers/:couponId",
  couponController.updateCouponUsers
);

// if api is invalid OR wrong URL
router.all("/**", function (req, res) {
  res.status(404).send({
    status: false,
    msg: "Invalid URL",
  });
});

module.exports = router;
