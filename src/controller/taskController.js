const TaskModel = require("../model/taskModel");
const mongoose = require("mongoose");
const validator = require("../validator/validator");

const getAllTasks = async (req, res) => {
  try {
    const Tasks = await TaskModel.find({});

    return res.status(200).send({ status: true, message: Tasks });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

const getTasksByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!validator.isValidObjectId(userId))
      return res
        .status(400)
        .send({ status: false, message: "Please provide valid ID" });

    const Tasks = await TaskModel.find({ taskAddUserId: userId });

    return res.status(200).send({ status: true, message: Tasks });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!validator.isValidObjectId(id))
      return res
        .status(400)
        .send({ status: false, message: "Please provide valid ID" });

    const Task = await TaskModel.findById(id);

    return res.status(200).send({ status: true, message: Task });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

const insertTask = async (req, res) => {
  try {
    const data = req.body;

    const Task = await TaskModel.create(data);

    return res
      .status(200)
      .send({ status: true, message: "Task added successfully." });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    if (!validator.isValidObjectId(id))
      return res
        .status(400)
        .send({ status: false, message: "Please provide valid ID" });

    const data = req.body;

    const Task = await TaskModel.findByIdAndUpdate(id, data);

    return res
      .status(200)
      .send({ status: true, message: "Task updated successfully." });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    if (!validator.isValidObjectId(id))
      return res
        .status(400)
        .send({ status: false, message: "Please provide valid ID" });

    const Task = await TaskModel.findByIdAndDelete(id);

    return res
      .status(200)
      .send({ status: true, message: "Task deleted successfully." });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

module.exports = {
  getAllTasks,
  getTasksByUserId,
  getTaskById,
  insertTask,
  updateTask,
  deleteTask,
};
