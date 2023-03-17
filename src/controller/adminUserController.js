const jwt = require("jsonwebtoken");
const AdminUserModel = require("../model/adminUserModel");
const { validateEmail } = require("./userController");

const addOAuthUsers = async (req, res) => {
  try {
    const reqBody = req.body;
    if (!reqBody)
      return res.status(400).send({
        status: false,
        message: "Invalid request parameters, Please provide login details.",
      });

    if (!reqBody.verified_email)
      return res.status(400).send({
        status: false,
        message: "Email is not verified, Please Verify before logging in.",
      });

    const user = await AdminUserModel.findOne({ email: reqBody.email });

    if (user && user.isAdminUser)
      return res.status(400).send({
        status: false,
        message: "User Exists. Please log in.",
      });
    else {
      let pass = "";
      if (reqBody.password)
        reqBody.password = await bcrypt.hash(reqBody.password, 10);

      const data = {
        source: reqBody.isAdminUser ? "superAdmin" : "OAuth",
        ...reqBody,
      };

      const user = await AdminUserModel.create(data);
      return res.status(201).send({
        status: true,
        message: "User first log in successful.",
        data: user,
      });
    }
  } catch (error) {
    console.log(req.body + ", error: " + error.message);
    return res.status(500).send({ status: false, message: error.message });
  }
};

const adminLogin = async (req, res) => {
  try {
    const body = req.body;
    console.log(body + "body");

    if (!validateEmail(body.email))
      return res.status(400).send({ status: false, message: "Invalid email." });

    const user = await AdminUserModel.findOne({
      email: body.email,
    });

    console.log(user + "user");

    if (!user)
      return res.status(400).send({
        status: false,
        message: "User does not Exist.",
      });

    const verifyPassword = await bcrypt.compare(body.password, user.password);

    if (!verifyPassword)
      return res.status(400).send({
        status: false,
        message: "Invalid password.",
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

module.exports = {
  adminLogin,
  addOAuthUsers,
};
