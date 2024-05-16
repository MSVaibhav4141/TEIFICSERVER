const express = require("express");
const app = express();
//Router
const router = require("./routes/productRoute");
const paymentRoute = require("./routes/paymentRoute");
const userRouter = require("./routes/userRoute");
const orderRouter = require("./routes/orderRoute");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const path = require("path");
const errorCatcher = require("./utils/errorCatcher");
const cookieParser = require("cookie-parser");
const cors = require('cors')

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());
app.use(express.static(path.join(__dirname, '../TEIFICCLIENT/build')));

  app.get('*', (req, res) =>
    res.sendFile(
      path.resolve(__dirname, '../', 'TEIFICCLIENT', 'build', 'index.html')
    )
  );
// Route Import
app.use("/VC1", router);
app.use("/VC1", userRouter);
app.use("/VC1", orderRouter);
app.use("/VC1", paymentRoute);
app.use(errorCatcher);

module.exports = app;
