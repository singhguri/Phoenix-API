const TaskModel = require("../model/taskModel");
const FrTaskModel = require("../model/frTaskModel");
const fetch = require("node-fetch");

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

// const getEnglishTasks = async ({ smallLen, bigLen, smallType, bigType }) => {
//   const tasks = await TaskModel.aggregate([
//     {
//       $match: {
//         $and: [
//           {
//             $or: [
//               { taskType: { $eq: smallType } },
//               { taskType: { $eq: "both" } },
//             ],
//           },
//           { taskSize: { $eq: "small" } },
//           // { lang: { $eq: "en" } },
//         ],
//       },
//     },
//     { $sample: { size: smallLen } },
//   ]);

//   const bigTasks = await TaskModel.aggregate([
//     {
//       $match: {
//         $and: [
//           {
//             $or: [
//               { taskType: { $eq: bigType } },
//               { taskType: { $eq: "both" } },
//             ],
//           },
//           { taskSize: { $eq: "big" } },
//           // { lang: { $eq: "en" } },
//         ],
//       },
//     },
//     { $sample: { size: bigLen } },
//   ]);

//   const smallTaskIds = tasks.map((x) => x._id);
//   const bigTaskIds = bigTasks.map((x) => x._id);

//   const langTasks = await FrTaskModel.find({
//     enTaskId: { $in: smallTaskIds },
//   });

//   const langBigTasks = await FrTaskModel.find({
//     enTaskId: { $in: bigTaskIds },
//   });

//   return [tasks, bigTasks, langTasks, langBigTasks];
// };

// const getFrenchTasks = async ({ smallLen, bigLen, smallType, bigType }) => {
//   const tasks = await FrTaskModel.aggregate([
//     {
//       $match: {
//         $and: [
//           {
//             $or: [
//               { taskType: { $eq: smallType } },
//               { taskType: { $eq: "both" } },
//             ],
//           },
//           { taskSize: { $eq: "small" } },
//           // { lang: { $eq: "fr" } },
//         ],
//       },
//     },
//     { $sample: { size: smallLen } },
//   ]);

//   const bigTasks = await FrTaskModel.aggregate([
//     {
//       $match: {
//         $and: [
//           {
//             $or: [
//               { taskType: { $eq: bigType } },
//               { taskType: { $eq: "both" } },
//             ],
//           },
//           { taskSize: { $eq: "big" } },
//           // { lang: { $eq: "fr" } },
//         ],
//       },
//     },
//     { $sample: { size: bigLen } },
//   ]);

//   const smallTaskIds = tasks.map((x) => x.enTaskId);
//   const bigTaskIds = bigTasks.map((x) => x.enTaskId);

//   const langTasks = await TaskModel.find({
//     _id: { $in: smallTaskIds },
//   });

//   const langBigTasks = await TaskModel.find({
//     _id: { $in: bigTaskIds },
//   });

//   return [tasks, bigTasks, langTasks, langBigTasks];
// };

const getRandomNumberedTasks = async (smallLen, bigLen, smallType, bigType) => {
  try {
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

    // sorting the arrays
    tasks.sort((a, b) => a._id - b._id);
    bigTasks.sort((a, b) => a._id - b._id);
    langTasks.sort((a, b) => a._id - b._id);
    langBigTasks.sort((a, b) => a._id - b._id);

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
      return res.status(400).send({
        status: false,
        message: "Task with same name already exists.",
      });

    const Task = await TaskModel.create(data);

    // send request to python translator API to translate to french
    (async () => {
      const rawResponse = await fetch(
        process.env.PYTHON_TRANSLATE_API_BASE + "fr",
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
        process.env.PYTHON_TRANSLATE_API_BASE + "fr",
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
