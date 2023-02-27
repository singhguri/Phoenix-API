const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const route = require("./route/route.js");
const multer = require("multer");
const cors = require("cors");
const app = express();

// import dotenv
require("dotenv").config();

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(multer().any());

const mongoURL =
  process.env.NODE_ENV === "prod"
    ? process.env.MONGO_URL_PROD
    : process.env.MONGO_URL_DEV;

console.log(mongoURL);

mongoose.set("strictQuery", false);
mongoose
  .connect(mongoURL, {
    useNewUrlParser: true,
  })
  .then(() => console.log("MongoDb is connected"))
  .catch((err) => console.log(err));

app.use("/", route);

app.listen(process.env.PORT || 5000, function () {
  console.log("Express app running on port: " + (process.env.PORT || 3000));
});
