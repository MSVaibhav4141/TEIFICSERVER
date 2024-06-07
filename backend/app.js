const express = require("express");
const app = express();
//Router
const router = require("./routes/productRoute");
const paymentRoute = require("./routes/paymentRoute");
const userRouter = require("./routes/userRoute");
const orderRouter = require("./routes/orderRoute");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const errorCatcher = require("./utils/errorCatcher");
const cookieParser = require("cookie-parser");
const cors = require('cors')

app.use(
    cors({
        credentials: true,
      origin: "http://www.teific.in/",
    })
);
app.use(cookieParser());

// Apply middleware to set Access-Control-Allow-Credentials header
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
});
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());
// Route Import
app.use("/VC1", router);
app.use("/VC1", userRouter);
app.use("/VC1", orderRouter);
app.use("/VC1", paymentRoute); 
app.use(errorCatcher);

module.exports = app;
