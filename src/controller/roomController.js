const RoomModel = require("../model/roomModel");
const mongoose = require("mongoose");
const { getRandomNumberedTasks } = require("./taskController");

const getAllRooms = async (req, res) => {
  try {
    const rooms = await RoomModel.find({});
    res.status(200).send({
      status: true,
      message: rooms,
    });
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};

const getRoomById = async (req, res) => {
  try {
    const { roomId } = req.params;
    if (!roomId)
      return res
        .status(400)
        .send({ status: false, message: "Please provide valid room Id..." });

    const room = await RoomModel.find({ id: roomId });

    res.status(200).send({
      status: true,
      message: room,
    });
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
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

    res.status(200).send({
      status: true,
      message: "Room deleted successfully...",
    });
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
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

    const randTasks = await getRandomNumberedTasks(body.taskNo);

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

module.exports = {
  createRoom,
  getAllRooms,
  getRoomById,
  deleteRoom,
};
