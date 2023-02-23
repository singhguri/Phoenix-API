const RoomModel = require("../model/roomModel");
const mongoose = require("mongoose");
const { getRandomNumberedTasks } = require("./taskController");

const createRoom = async (req, res) => {
  try {
    if (!req.body)
      res.status(400).send({
        status: false,
        message: "Invalid request parameters, Please provide room details.",
      });

    const body = req.body;
    const randTasks = getRandomNumberedTasks(body.taskNo);

    const roomInfo = await RoomModel.create({
      hostUserId: body.hostUserId,
      id: body.roomId,
      tasks: randTasks,
    });

    res.status(200).send({
      status: true,
      message: roomInfo,
    });
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};

const getRoomTasks = async (req, res) => {
  try {
    const { roomId } = req.params;
    if (!roomId)
      return res
        .status(400)
        .send({ status: false, message: "Please provide valid Room Id" });

    const room = await RoomModel.findOne({ id: roomId });
    if (room)
      return res.status(200).send({ status: true, message: room.tasks });
    else
      return res
        .status(400)
        .send({ status: false, message: "No room with this id exists." });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

module.exports = {
  createRoom,
  getRoomTasks,
};
