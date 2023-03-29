const FrTaskModel = require("../model/frTaskModel");
const TaskModel = require("../model/taskModel");
const { Roles } = require("../validator/validator");

const getAllTasks = async (req, res) => {
  try {
    const query = req.query;
    let Tasks = [];

    Tasks = query ? await FrTaskModel.find(query) : await FrTaskModel.find({});

    return res
      .status(200)
      .send({ status: true, count: Tasks.length, message: Tasks });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

const getRandomNumberedTasks = async (smallLen, bigLen, smallType, bigType) => {
  try {
    const tasks = await FrTaskModel.aggregate([
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
            // { lang: { $eq: "en" } },
          ],
        },
      },
      { $sample: { size: smallLen } },
    ]);

    const bigTasks = await FrTaskModel.aggregate([
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
            // { lang: { $eq: "en" } },
          ],
        },
      },
      { $sample: { size: bigLen } },
    ]);

    const smallTaskIds = tasks.map((x) => x._id);
    const bigTaskIds = bigTasks.map((x) => x._id);

    const langTasks = await FrTaskModel.find({
      enTaskId: { $in: smallTaskIds },
    });

    const langBigTasks = await FrTaskModel.find({
      enTaskId: { $in: bigTaskIds },
    });

    // sorting
    tasks.sort((a, b) => a._id - b._id);
    bigTasks.sort((a, b) => a._id - b._id);
    langTasks.sort((a, b) => a.enTaskId - b.enTaskId);
    langBigTasks.sort((a, b) => a.enTaskId - b.enTaskId);

    return [tasks, bigTasks, langTasks, langBigTasks];
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

    const Tasks = await FrTaskModel.find({ taskAddUserId: userId });

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

    const Task = await FrTaskModel.findById(id);

    return res.status(200).send({ status: true, message: Task });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

const insertTask = async (req, res) => {
  try {
    const data = req.body;
    const oldTask = await FrTaskModel.findOne({ taskName: data.taskName });

    if (oldTask)
      return res.status(400).send({
        status: false,
        message: "Task with same name already exists.",
      });

    // send request to python translator API to translate to english
    (async () => {
      const rawResponse = await fetch(
        process.env.PYTHON_TRANSLATE_API_BASE + "en",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );
      const resp = await rawResponse.json();

      if (resp.status) {
        const task = resp.message;

        // check if the task already exists
        const oldTask = await TaskModel.findOne({
          taskName: task.taskName,
        });

        if (!oldTask) {
          // add new english task
          const Task = await TaskModel.create(task);
          const frTask = { enTaskId: Task._id, ...data };

          // add new french task
          const frNewTask = await FrTaskModel.create(frTask);

          // add in tasks of user
          const adminUser = await AdminUserModel.find({ id: data.userId });
          let userTasks = adminUser.tasks;

          userTasks = [
            ...userTasks,
            {
              isAdminTask: adminUser.role === Roles.ADMIN,
              lang: "en",
              _id: Task._id,
            },
            {
              isAdminTask: adminUser.role === Roles.ADMIN,
              lang: "fr",
              _id: frNewTask._id,
            },
          ];

          const newAdminUser = await AdminUserModel.updateOne(
            { id: data.userId },
            { $set: { tasks: userTasks } },
            { new: true }
          );
        }
      }
    })();

    return res
      .status(200)
      .send({ status: true, message: "Task added successfully." });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

const insertTaskViaBulk = async (data) => {
  try {
    const oldTask = await FrTaskModel.findOne({ taskName: data.taskName });

    if (oldTask)
      return res.status(400).send({
        status: false,
        message: "Task with same name already exists.",
      });

    // send request to python translator API to translate to english
    (async () => {
      const rawResponse = await fetch(
        process.env.PYTHON_TRANSLATE_API_BASE + "en",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );
      const resp = await rawResponse.json();

      if (resp.status) {
        const task = resp.message;

        // check if the task already exists
        const oldTask = await TaskModel.findOne({
          taskName: task.taskName,
        });

        if (!oldTask) {
          // add new english task
          const Task = await TaskModel.create(task);
          const frTask = { enTaskId: Task._id, ...data };

          // add new french task
          const frNewTask = await FrTaskModel.create(frTask);

          // add in tasks of user
          const adminUser = await AdminUserModel.find({ id: data.userId });
          let userTasks = adminUser.tasks;

          userTasks = [
            ...userTasks,
            {
              isAdminTask: adminUser.role === Roles.ADMIN,
              lang: "en",
              _id: Task._id,
            },
            {
              isAdminTask: adminUser.role === Roles.ADMIN,
              lang: "fr",
              _id: frNewTask._id,
            },
          ];

          const newAdminUser = await AdminUserModel.updateOne(
            { id: data.userId },
            { $set: { tasks: userTasks } },
            { new: true }
          );
        }
      }
    })();

    return { status: true, message: "Task added successfully." };
  } catch (error) {
    return { status: false, message: error.message };
  }
};

const insertTaskBulk = async (req, res) => {
  try {
    const body = req.body;
    if (!body)
      return res
        .status(400)
        .send({ status: false, message: "Please provide valid body params." });

    let errItems = [];
    await body.forEach(async (item, index) => {
      try {
        const { status, message } = await insertTaskViaBulk(item);
      } catch (error) {
        errItems.push(item);
        console.log("item: " + item.taskDesc + " error: " + error);
      }
    });

    return res.status(200).send({
      status: true,
      message: errItems ? "Some Tasks added." : "Tasks added successfully.",
      errItems,
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

    const Task = await FrTaskModel.findByIdAndUpdate(id, data);

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

    const Task = await FrTaskModel.findByIdAndDelete(id);

    return res
      .status(200)
      .send({ status: true, message: "Task deleted successfully." });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

const deleteTaskBulk = async (req, res) => {
  try {
    const Task = await FrTaskModel.deleteMany({});

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
