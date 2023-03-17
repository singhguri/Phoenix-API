const SettingModel = require("../model/settingModel");

const getAllSettingsByUserId = async (req, res) => {
  try {
    const { userId } = req.parmas;
    if (!userId)
      return res
        .status(400)
        .send({ status: false, message: "Please provide valid ID" });

    const settings = await SettingModel.find({ userId: userId });

    return res.status(200).send({ status: true, message: settings });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

module.exports = { getAllSettingsByUserId };
