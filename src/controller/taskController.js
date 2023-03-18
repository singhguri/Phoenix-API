const TaskModel = require("../model/taskModel");

const getAllTasks = async (req, res) => {
  try {
    const Tasks = await TaskModel.find({ lang: "en" });

    return res
      .status(200)
      .send({ status: true, count: Tasks.length, message: Tasks });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

const getRandomNumberedTasks = async (
  smallLen,
  bigLen,
  smallType,
  bigType,
  lang
) => {
  try {
    console.log(smallLen, bigLen, smallType, bigType, lang);
    const tasks = await TaskModel.aggregate([
      {
        $match: {
          $and: [
            {
              $or: [
                { taskType: { $eq: smallType } },
                { taskType: { $eq: "both" } },
              ],
            },
            { taskSize: { $eq: "small" } },
            { lang: { $eq: lang } },
          ],
        },
      },
      { $sample: { size: smallLen } },
    ]);

    const bigTasks = await TaskModel.aggregate([
      {
        $match: {
          $and: [
            {
              $or: [
                { taskType: { $eq: bigType } },
                { taskType: { $eq: "both" } },
              ],
            },
            { taskSize: { $eq: "big" } },
            { lang: { $eq: lang } },
          ],
        },
      },
      { $sample: { size: bigLen } },
    ]);

    return [tasks, bigTasks];
  } catch (error) {
    return error.message;
  }
};

const getTasksByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId)
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
    const oldTask = await TaskModel.findOne({ taskName: data.taskName });

    if (oldTask)
      return res.status(400).send({
        status: false,
        message: "Task with same name already exists.",
      });

    const Task = await TaskModel.create(data);
    console.log(Task);
    return res
      .status(200)
      .send({ status: true, message: "Task added successfully." });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

const insertTaskBulk = async (req, res) => {
  try {
    const body = req.body;
    if (!body)
      return res
        .status(400)
        .send({ status: false, message: "Please provide valid body params." });

    await body.forEach(async (item, index) => {
      try {
        const oldTask = await TaskModel.find({ taskName: item.taskName });
        if (!oldTask || oldTask.length === 0) {
          const newTask = {
            taskSize: item.isSmallTask ? "small" : "big",
            ...item,
          };
          const Task = await TaskModel.create(newTask);
        }
      } catch (error) {
        console.log("item: " + item.taskDesc + " error: " + error);
      }
    });

    return res.status(200).send({
      status: true,
      message: "Tasks added successfully.",
    });
  } catch (error) {
    console.log();
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

const deleteTaskBulk = async (req, res) => {
  try {
    const Task = await TaskModel.deleteMany({});

    return res
      .status(200)
      .send({ status: true, message: "All Tasks deleted successfully." });
  } catch (error) {
    console.log(req.body + ", error: " + error.message);
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
  deleteTaskBulk,
};
