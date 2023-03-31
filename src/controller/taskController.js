const TaskModel = require("../model/taskModel");
const FrTaskModel = require("../model/frTaskModel");
const fetch = require("node-fetch");
const AdminUserModel = require("../model/adminUserModel");
const UserModel = require("../model/userModel");
const { Roles } = require("../validator/validator");

const getAllLangTasks = async (req, res) => {
  try {
    let Tasks = [];
    Tasks.push(...(await TaskModel.find({})));
    Tasks.push(...(await FrTaskModel.find({})));

    return res
      .status(200)
      .send({ status: true, count: Tasks.length, message: Tasks });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

const getAllTasks = async (req, res) => {
  try {
    const query = req.query;
    let Tasks = [];

    Tasks = query ? await TaskModel.find(query) : await TaskModel.find({});

    return res
      .status(200)
      .send({ status: true, count: Tasks.length, message: Tasks });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

const getRandomAdminTasks = async (smallLen, bigLen, smallType, bigType) => {
  try {
    // get admin user
    const adminUser = await AdminUserModel.findOne({ id: "1" });

    // get english tasks from adminUserTasks
    const adminUserTasks = adminUser.tasks;
    const enTasks = adminUserTasks.map((item) => {
      if (item.lang === "en") return item.taskName;
    });

    const smallTaskTypeFilter = [
      smallType !== "both" ? { taskType: { $eq: smallType } } : {},
      { taskType: { $eq: "both" } },
    ];
    const bigTaskTypeFilter = [
      bigType !== "both" ? { taskType: { $eq: bigType } } : {},
      { taskType: { $eq: "both" } },
    ];

    const tasks = await TaskModel.aggregate([
      {
        $match: {
          $and: [
            {
              $or: smallTaskTypeFilter,
            },
            { taskSize: { $eq: "small" } },
            { taskName: { $in: enTasks } },
          ],
        },
      },
      { $sample: { size: smallLen } },
    ])
      .sort({ _id: 1 })
      .exec();

    const bigTasks = await TaskModel.aggregate([
      {
        $match: {
          $and: [
            {
              $or: bigTaskTypeFilter,
            },
            { taskSize: { $eq: "big" } },
            { taskName: { $in: enTasks } },
          ],
        },
      },
      { $sample: { size: bigLen } },
    ])
      .sort({ _id: 1 })
      .exec();

    const smallTaskIds = tasks.map((x) => x._id);
    const bigTaskIds = bigTasks.map((x) => x._id);

    // french tasks
    const langTasks = await FrTaskModel.find({
      enTaskId: { $in: smallTaskIds },
    })
      .sort({ enTaskId: 1 })
      .exec();

    const langBigTasks = await FrTaskModel.find({
      enTaskId: { $in: bigTaskIds },
    })
      .sort({ enTaskId: 1 })
      .exec();

    return [tasks, bigTasks, langTasks, langBigTasks];
  } catch (error) {
    console.log(error);
  }
};

const getRandomNumberedTasks = async (
  smallLen,
  bigLen,
  smallType,
  bigType,
  userId
) => {
  try {
    const user = await UserModel.findOne({ id: userId });
    if (!user) return getRandomAdminTasks(smallLen, bigLen, smallType, bigType);

    const adminUser = await AdminUserModel.findOne({ email: user.email });
    if (!adminUser)
      return getRandomAdminTasks(smallLen, bigLen, smallType, bigType);

    // get english tasks from adminUserTasks
    const adminUserTasks = adminUser.tasks;
    const enTasks = adminUserTasks.map((item) => {
      if (item.lang === "en") return item.taskName;
    });

    // english tasks
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
            { taskName: { $in: enTasks } },
          ],
        },
      },
      { $sample: { size: smallLen } },
    ])
      .sort({ _id: 1 })
      .exec();

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
            { taskName: { $in: enTasks } },
          ],
        },
      },
      { $sample: { size: bigLen } },
    ])
      .sort({ _id: 1 })
      .exec();

    const smallTaskIds = tasks.map((x) => x._id);
    const bigTaskIds = bigTasks.map((x) => x._id);

    // french tasks
    const langTasks = await FrTaskModel.find({
      enTaskId: { $in: smallTaskIds },
    })
      .sort({ enTaskId: 1 })
      .exec();

    const langBigTasks = await FrTaskModel.find({
      enTaskId: { $in: bigTaskIds },
    })
      .sort({ enTaskId: 1 })
      .exec();

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
        .status(200)
        .send({ status: false, message: "Please provide valid ID" });

    let Tasks = [];
    const user = await AdminUserModel.findOne({ id: userId });

    const enTaskNames = user.tasks.map((item) => {
      if (item.lang === "en") return item.taskName;
    });

    const frTaskNames = user.tasks.map((item) => {
      if (item.lang === "fr") return item.taskName;
    });

    Tasks.push(...(await TaskModel.find({ taskName: { $in: enTaskNames } })));
    Tasks.push(...(await FrTaskModel.find({ taskName: { $in: frTaskNames } })));

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
        .status(200)
        .send({ status: false, message: "Please provide valid ID" });

    const Task = await TaskModel.findById(id);

    const frTask = await FrTaskModel.find({ enTaskId: Task._id });

    console.log(frTask);

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
      return res.status(200).send({
        status: false,
        message: "Task with same name already exists.",
      });

    // translate task to french & save to french tasks table
    // send request to python translator API to translate to french
    (async () => {
      const rawResponse = await fetch(
        process.env.PYTHON_TRANSLATE_API_BASE + "task/fr",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );
      const resp = await rawResponse.json();
      console.log(res);
      if (resp.status) {
        const frTask = resp.message;

        const oldTask = await FrTaskModel.findOne({
          taskName: frTask.taskName,
        });

        console.log(oldTask);

        if (!oldTask) {
          // add task to english tasks table
          const Task = await TaskModel.create(data);

          // add new french task
          frTask.enTaskId = Task._id;
          const FrTask = await FrTaskModel.create(frTask);

          // update tasks of the user
          const adminUser = await AdminUserModel.findOne({
            id: data.taskAddUserId,
          });

          let userTasks = adminUser.tasks;

          userTasks = [
            ...userTasks,
            {
              isAdminTask: adminUser.role === Roles.ADMIN,
              lang: "en",
              taskName: Task.taskName,
            },
            {
              isAdminTask: adminUser.role === Roles.ADMIN,
              lang: "fr",
              taskName: FrTask.taskName,
            },
          ];

          const newAdminUser = await AdminUserModel.findOneAndUpdate(
            { id: data.taskAddUserId },
            { $set: { tasks: userTasks } },
            { new: true }
          );

          return res
            .status(200)
            .send({ status: true, message: "Task added successfully." });
        }
      }
    })();
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

const insertTaskViaBulk = async (data) => {
  try {
    const oldTask = await TaskModel.findOne({ taskName: data.taskName });

    if (oldTask)
      return res.status(400).send({
        status: false,
        message: "Task with same name already exists.",
      });

    const Task = await TaskModel.create(data);

    // send request to python translator API to translate to french
    (async () => {
      const rawResponse = await fetch(
        process.env.PYTHON_TRANSLATE_API_BASE + "task/fr",
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
        const frTask = resp.message;

        const oldTask = await FrTaskModel.findOne({
          taskName: frTask.taskName,
        });

        if (!oldTask) {
          // add new french task
          frTask.enTaskId = Task._id;
          const Task = await FrTaskModel.create(frTask);

          // update userTasks
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
              _id: frTask._id,
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
  getAllLangTasks,
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
