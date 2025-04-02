const jwtMssg = (user, statusCode, res) => {
  const token = user.getJWTToken();
  const options = {
    expires: new Date(Date.now() + process.env.COOKIE_EXP * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };


  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    token,
    user,
  });
};

module.exports = jwtMssg;
