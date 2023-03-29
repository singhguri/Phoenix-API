const jwt = require("jsonwebtoken");
const AdminUserModel = require("../model/adminUserModel");
const { validateEmail } = require("./userController");
const bcrypt = require("bcrypt");
const TaskModel = require("../model/taskModel");
const { Roles } = require("../validator/validator");
const FrTaskModel = require("../model/frTaskModel");

const addAdminUser = async (req, res) => {
  try {
    const reqBody = req.body;
    if (!reqBody)
      return res.status(400).send({
        status: false,
        message: "Invalid request parameters, Please provide login details.",
      });

    if (!reqBody.verified_email)
      return res.status(400).send({
        status: false,
        message: "Email is not verified, Please Verify before logging in.",
      });

    const user = await AdminUserModel.findOne({ email: reqBody.email });

    if (user && user.isAdminUser)
      return res.status(400).send({
        status: false,
        message: "User Exists. Please log in.",
      });
    else {
      let pass = "";
      if (reqBody.password)
        reqBody.password = await bcrypt.hash(reqBody.password, 10);

      let adminTasks = [];
      const tasks = (await TaskModel.find({ taskAddUserId: "1" })).map(
        (item) => item.taskName
      );
      const frTasks = (await FrTaskModel.find({ taskAddUserId: "1" })).map(
        (item) => item.taskName
      );

      tasks.forEach((item, index) => {
        adminTasks.push({
          taskName: item,
          lang: "en",
          isAdminTask: true,
        });
      });

      frTasks.forEach((item, index) => {
        adminTasks.push({
          taskName: item,
          lang: "fr",
          isAdminTask: true,
        });
      });

      console.log(adminTasks);

      const data = {
        source: reqBody.isAdminUser ? "superAdmin" : "OAuth",
        tasks: adminTasks,
        ...reqBody,
      };

      const user = await AdminUserModel.create(data);
      return res.status(201).send({
        status: true,
        message: "User added successfully.",
        data: user,
      });
    }
  } catch (error) {
    console.log(req.body + ", error: " + error.message);
    return res.status(500).send({ status: false, message: error.message });
  }
};

const getAdminUsers = async (req, res) => {
  try {
    const users = await AdminUserModel.find({});
    return res.status(200).send({
      status: true,
      message: users,
    });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

const deleteAdminUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await AdminUserModel.findOneAndDelete({ id: userId });

    return res.status(200).send({
      status: true,
      message: "Admin User Deleted successfully.",
    });
  } catch (error) {
    console.log(req.params + ", error: " + error.message);
    return res.status(500).send({ status: false, message: error.message });
  }
};

const getAdminUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await AdminUserModel.findOne({ id: userId });

    return res.status(200).send({
      status: true,
      message: user,
    });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

const updateAdminUserTasks = async (req, res) => {
  try {
    const { userId } = req.params;
    const body = req.body;

    const user = await AdminUserModel.findOne({ id: userId });
    const tasks = [...user.tasks, ...body.tasks];

    const newUser = await AdminUserModel.updateOne(
      { id: userId },
      { $set: { tasks: tasks } },
      { new: true }
    );

    return res.status(200).send({
      status: true,
      message: "Admin user updated successfully...",
    });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

const deleteAdminUserTasks = async (req, res) => {
  try {
    const { userId, taskId, lang } = req.body;

    if (!userId || !taskId)
      return res.status(200).send({
        status: false,
        message: "Invalid body parameteres...",
      });

    // delete from user Task list
    const user = await AdminUserModel.findOne({ id: userId });
    let task, frTask;

    if (lang === "en") {
      task = await TaskModel.findById(taskId);
      frTask = await FrTaskModel.findOne({ enTaskId: taskId });
    } else {
      frTask = await FrTaskModel.findById(taskId);
      task = await TaskModel.findById(frTask.enTaskId);
    }

    const tasks = user.tasks.filter(
      (item) => ![task.taskName, frTask.taskName].includes(item.taskName)
    );

    const newUser = await AdminUserModel.findOneAndUpdate(
      { id: userId },
      { $set: { tasks: tasks } },
      { new: true }
    );

    // delete from tasks table if task is added by non-admin
    const taskUser = AdminUserModel.findOne({ id: task.taskAddUserId });
    if (taskUser.role === Roles.CLIENT)
      await TaskModel.findByIdAndDelete(taskId);

    return res.status(200).send({
      status: true,
      message: "Task deleted successfully...",
    });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

const adminLogin = async (req, res) => {
  try {
    const body = req.body;

    if (!validateEmail(body.email))
      return res.status(400).send({ status: false, message: "Invalid email." });

    const user = await AdminUserModel.findOne({
      email: body.email,
    });

    if (!user)
      return res.status(200).send({
        status: false,
        message: "User does not Exist.",
      });

    const verifyPassword = await bcrypt.compare(body.password, user.password);

    if (!verifyPassword)
      return res.status(200).send({
        status: false,
        message: "Invalid password.",
      });

    const token = jwt.sign(
      {
        userId: user.id,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 10 * 60,
      },
      process.env.JWT_SECRET
    );

    return res.status(200).send({
      status: true,
      message: "Logged in successfully.",
      data: user,
      token: token,
    });
  } catch (error) {
    console.log(req.body + ", error: " + error.message);
    return res.status(500).send({ status: false, message: error.message });
  }
};

module.exports = {
  adminLogin,
  addAdminUser,
  deleteAdminUser,
  getAdminUsers,
  updateAdminUserTasks,
  getAdminUserById,
  deleteAdminUserTasks,
};
