const RoomModel = require("../model/roomModel");
const mongoose = require("mongoose");
const { getRandomNumberedTasks } = require("./taskController");
const CreateRoomViaSocket = require("../middleware/ioSocket");

const getAllRooms = async (req, res) => {
  try {
    const rooms = await RoomModel.find({});
    return res.status(200).send({
      status: true,
      message: rooms,
    });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

const getRoomById = async (req, res) => {
  try {
    const { roomId } = req.params;
    if (!roomId)
      return res
        .status(400)
        .send({ status: false, message: "Please provide valid room Id..." });

    const room = await RoomModel.findOne({ id: roomId });

    return res.status(200).send({
      status: true,
      message: room,
    });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

const deleteRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    if (!roomId)
      return res
        .status(400)
        .send({ status: false, message: "Please provide valid room Id..." });

    const room = await RoomModel.deleteOne({ id: roomId });

    return res.status(200).send({
      status: true,
      message: "Room deleted successfully...",
    });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

const createRoom = async (req, res) => {
  try {
    if (!req.body)
      res.status(400).send({
        status: false,
        message: "Invalid request parameters, Please provide room details.",
      });

    const body = req.body;

    const [
      randTasks,
      bigTasks,
      langTasks,
      langBigTasks,
    ] = await getRandomNumberedTasks(
      body.taskNo,
      body.bigTaskNo,
      body.taskType,
      body.bigTaskType
    );

    const roomInfo = await RoomModel.create({
      hostUserId: body.hostUserId,
      id: body.roomId,
      enTasks: {
        tasks: randTasks,
        bigTasks: bigTasks,
      },
      frTasks: {
        tasks: langTasks,
        bigTasks: langBigTasks,
      },
    });

    return res.status(200).send({
      status: true,
      message: roomInfo,
    });
  } catch (error) {
    console.log(req.body);
    return res.status(500).send({ status: false, message: error.message });
  }
};

const createRoomSocket = async (req, res) => {
  try {
    CreateRoomViaSocket();

    return res.status(200).send({
      status: true,
      message: roomInfo,
    });
  } catch (error) {
    console.log(req.body);
    return res.status(500).send({ status: false, message: error.message });
  }
};

module.exports = {
  createRoom,
  getAllRooms,
  getRoomById,
  deleteRoom,
  createRoomSocket,
};
