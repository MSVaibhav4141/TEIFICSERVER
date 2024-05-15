const ErrorHandler = require("../errorHandler/errorHandler");

const roleAuth = (...roles) => {
    return (req, res, next) => {
        if(!roles.includes(req.user.role)){
            return next(new ErrorHandler('You are not an admin', 403));
        }
        next();
    }
}
module.exports = roleAuth