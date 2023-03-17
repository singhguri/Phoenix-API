const UserModel = require("../model/userModel");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const crypto = require("crypto-js");

//name validation name can only contain [a-z], [A-Z]and space
const validateName = (name) => {
  return String(name)
    .trim()
    .match(/^[a-zA-Z][a-zA-Z\s]+$/);
};

//email validation function
const validateEmail = (email) => {
  return String(email)
    .trim()
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

//MOBILE NUMBER VALIDATION must be number start with 6,7,8,9 and of 10 digit
const validateNumber = (number) => {
  return String(number)
    .trim()
    .match(
      ///^(\+\d{1,3}[- ]?)?\d{10}$/
      /^[6-9]\d{9}$/gi
    );
};

const encryptWithAES = (text) => {
  const passphrase = process.env.PASSWORD_PASSPHRASE;
  return CryptoJS.AES.encrypt(text, passphrase).toString();
};

const decryptWithAES = (ciphertext) => {
  const passphrase = process.env.PASSWORD_PASSPHRASE;
  const bytes = CryptoJS.AES.decrypt(ciphertext, passphrase);
  const originalText = bytes.toString(CryptoJS.enc.Utf8);
  return originalText;
};

const adminLogin = async (req, res) => {
  try {
    const body = req.body;
    if (!validateEmail(body.email))
      return res.status(400).send({ status: false, message: "Invalid email." });

    const user = await UserModel.find({
      isAdmin: true,
      email: body.email,
      password: encryptWithAES(body.password),
    });

    if (!user)
      return res.status(400).send({
        status: true,
        message: "User does not Exist.",
      });

    const token = jwt.sign(
      {
        userId: user.id,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 10 * 60,
      },
      process.env.JWT_SECRET
    );

    return res.status(200).send({
      status: true,
      message: "Logged in successfully.",
      data: user,
      token: token,
    });
  } catch (error) {
    console.log(req.body + ", error: " + error.message);
    return res.status(500).send({ status: false, message: error.message });
  }
};

const loginByOAuth = async (req, res) => {
  try {
    const reqBody = req.body;
    if (!reqBody)
      res.status(400).send({
        status: false,
        message: "Invalid request parameters, Please provide login details.",
      });

    if (!reqBody.verified_email)
      res.status(400).send({
        status: false,
        message: "Email is not verified, Please Verify before logging in.",
      });

    const user = await UserModel.findOne({ email: reqBody.email });

    if (user)
      return res.status(200).send({
        status: true,
        message: "User Exists. Please log in.",
        data: user,
      });
    else {
      let pass = "";
      if (reqBody.password) pass = "";

      const data = { password: pass, source: "OAuth", ...reqBody };

      const user = await UserModel.create(data);
      return res.status(201).send({
        status: true,
        message: "User first log in successful.",
        data: user,
      });
    }
  } catch (error) {
    console.log(req.body + ", error: " + error.message);
    res.status(500).send({ status: false, message: error.message });
  }
};

const getOAuthUsers = async (req, res) => {
  try {
    const users = await UserModel.find({});
    res.status(200).send({
      status: true,
      message: users,
    });
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};

const getOAuthUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    if (userId) {
      const user = await UserModel.find({ id: userId });
      return res.status(200).send({ status: true, message: user });
    } else
      return res.status(400).send({
        status: false,
        message: "Invalid request parameters, Please provide valid userId.",
      });
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};

const updateOAuthUsers = async (req, res) => {
  try {
    const { userId } = req.params;
    const reqBody = req.body;

    if (userId && reqBody) {
      const user = await UserModel.findOneAndUpdate(
        { id: userId },
        { $set: reqBody }
      );

      return res
        .status(200)
        .send({ status: true, message: "user updated successfully." });
    } else
      return res.status(400).send({
        status: false,
        message:
          "Invalid request parameters, Please provide valid parameters and/or body.",
      });
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};

const deleteOauthUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await UserModel.findOneAndDelete({ id: userId });

    res.status(200).send({
      status: true,
      message: "User Deleted successfully.",
    });
  } catch (error) {
    console.log(req.params + ", error: " + error.message);
    res.status(500).send({ status: false, message: error.message });
  }
};

const changeUserCoins = async (req, res) => {
  try {
    const { userCoins, userId, operation } = req.body;
    if (!userId || !userCoins || !operation)
      res.status(400).send({
        status: false,
        message: "Invalid request parameters, Please provide all details.",
      });

    const user = await UserModel.findOne({ id: userId });
    if (user) {
      let resCoins = 0;

      if (operation.toLowerCase() === "add") {
        resCoins = user.coins + userCoins;
        await UserModel.findOneAndUpdate({ id: userId }, { coins: resCoins });
      } else if (operation.toLowerCase() === "sub") {
        resCoins = user.coins - userCoins;
        if (resCoins < 0) resCoins = 0;
        await UserModel.findOneAndUpdate({ id: userId }, { coins: resCoins });
      }

      res.status(200).send({
        status: true,
        message: "User coins updated successfully.",
      });
    } else {
      return res
        .status(400)
        .send({ status: false, message: "User with this id does not exist." });
    }
  } catch (error) {
    console.log(req.body);
    res.status(500).send({ status: false, message: error.message });
  }
};

module.exports = {
  adminLogin,
  loginByOAuth,
  getOAuthUsers,
  updateOAuthUsers,
  getOAuthUserById,
  deleteOauthUser,
  changeUserCoins,
};
