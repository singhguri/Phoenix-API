const UserModel = require("../model/userModel");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const validator = require("../validator/validator");

//--------------------------------------------------------------------------------------------------------------------------------------

//name validation name can only contain [a-z],[A-Z]and space
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

const salt = 10;

const register = async (req, res) => {
  try {
    const data = req.body;

    //check for empty body
    if (Object.keys(data).length == 0) {
      return res
        .status(400)
        .send({ status: false, message: "please enter some DETAILS!!!" });
    }

    //fname is mandatory and must be in [Mr , Mrs , Miss]------------------------------------------------
    if (!data.fname) {
      return res
        .status(400)
        .send({ status: false, message: "firest name is required!!!" });
    }
    if (!validateName(data.fname)) {
      return res
        .status(400)
        .send({ status: false, message: "first name is INVALID!!!" });
    }

    //check for user name---------------------------------------------------------------------------------
    if (!data.lname) {
      return res
        .status(400)
        .send({ status: false, message: "last NAME is required!!!" });
    }
    if (!validateName(data.lname)) {
      return res
        .status(400)
        .send({ status: false, message: "last NAME is INVALID!!!" });
    }

    //phone no---------------------------------------------------------------------------------------------

    if (!data.phone) {
      return res
        .status(400)
        .send({ status: false, message: "User phone number is missing" });
    }
    if (!validateNumber(data.phone)) {
      return res
        .status(400)
        .send({ status: false, message: "User phone number is INVALID" });
    }
    //check for unique phone number
    const phone = await UserModel.findOne({ phone: data.phone });
    if (phone) {
      return res
        .status(400)
        .send({ status: false, message: "User phone number already exists" });
    }

    //email--------------------------------------------------------------------------------------------------
    if (!data.email)
      return res
        .status(400)
        .send({ status: false, message: "email is missing" });

    if (!validateEmail(data.email)) {
      return res
        .status(400)
        .send({ status: false, message: "Invaild E-mail id " }); //email validation
    }
    //check for unique email
    const email = await UserModel.findOne({ email: data.email });
    if (email) {
      return res
        .status(400)
        .send({ status: false, message: "email already exist" });
    }

    //password----------------------------------------------------------------------------------------------
    if (!data.password)
      return res
        .status(400)
        .send({ status: false, message: "password is missing" });

    if (data.password.length < 8 || data.password.length > 15)
      return res.status(400).send({
        message: "password length must be minimum of 8 and max of 15 character",
      });

    //hashing password and storing in database
    const hashPassword = await bcrypt.hash(data.password, 10);
    data.password = hashPassword;

    console.log(data);

    let files = req.files;
    if (files && files.length > 0) {
      // let uploadedFileURL = await uploadFile(files[0]);
      // data.profileImage = uploadedFileURL;
      console.log(2);
    } else {
      return res.status(400).send({ message: "profile cover image not given" });
    }

    // //create user--------------------------------------------------------------------------------------------------
    const user = await UserModel.create(data);
    return res
      .status(201)
      .send({ status: true, message: "success", data: user });
  } catch (err) {
    res.status(500).send({ status: false, message: err.message });
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

    const oldUser = UserModel.find({ email: reqBody.email });

    if (oldUser)
      return res.status(400).send({
        status: false,
        message: "User already exists. Please log in.",
      });
    else {
      const data = { source: "OAuth", ...reqBody };

      const user = await UserModel.create(data);
      return res
        .status(201)
        .send({ status: true, message: "User first log in successful." });
    }
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};

const login = async function (req, res) {
  try {
    const requestBody = req.body;
    if (Object.keys(requestBody).length == 0) {
      res.status(400).send({
        status: false,
        message: "Invalid request parameters, Please provide login details",
      });
      return;
    }

    //Extract params
    const { email, password } = requestBody;

    //validation starts
    if (!email) {
      res.status(400).send({ status: false, message: `Email is required` });
      return;
    }

    if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      res.status(400).send({
        status: false,
        message: `Email should be a valid email address`,
      });
      return;
    }

    if (!password) {
      res.status(400).send({ status: false, message: `Password is required` });
      return;
    }
    //validation ends

    const match = await UserModel.findOne({ email });

    if (!match) {
      res.status(400).send({ status: false, message: `Invalid login email` });
      return;
    }

    //bcrypt
    let p = await bcrypt.compare(password, match.password);
    if (!p)
      return res.status(401).send({ status: false, msg: "invalid password" });

    const token = jwt.sign(
      {
        userId: match._id,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 10 * 60 * 60,
      },
      "My private key"
    );

    res.header("x-api-key", token);
    res.status(200).send({
      status: true,
      message: `User login successfully`,
      data: { userId: match._id, token: token },
    });
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};

const getOAuthUsers = async (req, res) => {
  try {
    const users = await UserModel.find({ source: "OAuth" });
    res.status(200).send({
      status: true,
      data: { users },
    });
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};

const deleteOauthUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await userModel.findOneAndUpdate(
      { id: userId },
      { isActive: false }
    );

    res.status(200).send({
      status: true,
      message: "User Deleted successfully.",
    });
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};

const getUserDetails = async function (req, res) {
  try {
    const userIdfromParams = req.params.userId;
    const userIdFromToken = req.userId;
    let userId = req.params.userId;
    //let TokenuserId = req.TokenUserId

    let isValiduserID = mongoose.Types.ObjectId.isValid(userIdfromParams); //check if objectId is correct
    if (!isValiduserID) {
      return res
        .status(400)
        .send({ status: false, message: "user Id is Not Valid" });
    }
    let checkId = await UserModel.findOne({ _id: userId });
    if (!checkId) {
      return res.status(404).send({ status: false, message: "User Not Found" });
    }
    let TokenuserId = req.TokenUserId;
    if (TokenuserId != userId) {
      return res
        .status(400)
        .send({ status: false, message: "you are not authorized" });
    }

    // if (userIdFromToken != userIdfromParams) {
    //     return res.status(403).send({ status: false, message: "Unauthorized access" });
    // };

    return res
      .status(200)
      .send({ status: true, message: "User details", data: checkId });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};
//---------------------------------update user----------------------------------//
const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!validator.isValidObjectId(userId)) {
      return res
        .status(400)
        .send({ status: false, message: "Please provide valid ID" });
    }

    let TokenuserId = req.TokenUserId;
    if (TokenuserId != userId) {
      return res
        .status(400)
        .send({ status: false, message: "you are not authorized" });
    }

    const data = req.body; //JSON.parse(JSON.stringify(req.body))
    const files = req.files;
    const { password } = data;
    const updateUserData = {};
    // if(!validator.isValidObject(data)){
    //     return res.status(400).send ({status:false, message :"Please provide body"})
    // }
    const isUserExist = await UserModel.findById(userId);
    if (!isUserExist) {
      return res.status(404).send({ status: false, message: "user not found" });
    }
    if (data._id) {
      return res
        .status(400)
        .send({ status: false, message: "can not update user id" });
    }
    if (data.fname) {
      if (!validator.isValid(data.fname)) {
        return res
          .status(400)
          .send({ status: false, message: "please provide valid first name" });
      }
      if (!validator.isValidString(data.fname)) {
        return res.status(400).send({
          status: false,
          message: "please enter letters only in first name",
        });
      }
      updateUserData.fname = data.fname;
    }
    if (data.lname) {
      if (!validator.isValid(data.lname)) {
        return res
          .status(400)
          .send({ status: false, message: "please provide valid lname name" });
      }
      if (!validator.isValidString(data.lname)) {
        return res.status(400).send({
          status: false,
          message: "please enter letters only in last name",
        });
      }
      updateUserData.lname = data.lname;
    }
    if (data.email) {
      if (!validator.isValidEmail(data.email)) {
        return res
          .status(400)
          .send({ status: false, message: "Please provide valid email Id" });
      }
      const isEmailInUse = await UserModel.findOne({ email: data.email });
      if (isEmailInUse) {
        return res.status(400).send({
          status: false,
          message: "email already registered, enter different email",
        });
      }
      updateUserData.email = data.email;
    }
    if (data.phone) {
      if (!validator.isValidPhone(data.phone)) {
        return res.status(400).send({
          status: false,
          message:
            "Please provide 10 digit number && number should start with 6,7,8,9",
        });
      }
      const isPhoneInUse = await UserModel.findOne({ phone: data.phone });
      if (isPhoneInUse) {
        return res.status(400).send({
          status: false,
          message: "phone number already registered, enter different number",
        });
      }
      updateUserData.phone = data.phone;
    }
    //it check image avilable or not
    if (files && files.length > 0) {
      const link = await uploadFile(files[0]);
      updateUserData.profileImage = link;
    }
    if (password) {
      const hash = await bcrypt.hash(password, salt);
      updateUserData.password = hash;
    }

    if (!validator.isValidObject(updateUserData)) {
      return res
        .status(400)
        .send({ status: false, message: "please enter data for updation" });
    }
    const updateUser = await UserModel.findOneAndUpdate(
      { _id: userId },
      updateUserData,
      { new: true }
    );
    return res.status(200).send({
      status: true,
      message: "User profile update successfully",
      data: updateUser,
    });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

module.exports = {
  register,
  login,
  getUserDetails,
  updateUser,
  loginByOAuth,
  getOAuthUsers,
  deleteOauthUser,
};
