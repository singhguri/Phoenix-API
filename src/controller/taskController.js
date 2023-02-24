const TaskModel = require("../model/taskModel");

const getAllTasks = async (req, res) => {
  try {
    const Tasks = await TaskModel.find({});

    return res
      .status(200)
      .send({ status: true, count: Tasks.length, message: Tasks });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

const getRandomNumberedTasks = async (length) => {
  try {
    let data = [];
    const tasks = await TaskModel.find({});
    if (tasks)
      for (let index = 0; index < length; index++) {
        const val = tasks[Math.floor(Math.random() * tasks.length)];
        if (!data.includes(val)) data.push(val);
      }

    return data;
  } catch (error) {
    return error.message;
  }
};

const getTasksByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    // if (!validator.isValidObjectId(userId))
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
    if (!id)
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
    const oldTask = await TaskModel.find({ taskName: data.taskName });
    if (oldTask)
      return res.status(400).send({
        status: false,
        message: "Task with same name already exists.",
      });

    const Task = await TaskModel.create(data);

    return res
      .status(200)
      .send({ status: true, message: "Task added successfully." });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

const insertTaskBulk = async (req, res) => {
  try {
    let errTasks = [],
      successTasks = [];

    const body = req.body;
    if (!body)
      return res
        .status(400)
        .send({ status: false, message: "Please provide valid body params." });

    await body.forEach(async (item, index) => {
      const oldTask = await TaskModel.find({ taskName: item.taskName });
      if (oldTask) errTasks.push(item);
      else {
        const Task = await TaskModel.create(item);
        if (Task) successTasks.push(item);
        else errTasks.push(item);
      }
    });

    return res.status(200).send({
      status: true,
      message: "Tasks added successfully.",
      errorTasks: errTasks,
    });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id)
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
    if (!id)
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
  getRandomNumberedTasks,
  getTasksByUserId,
  getTaskById,
  insertTask,
  insertTaskBulk,
  updateTask,
  deleteTask,
};
