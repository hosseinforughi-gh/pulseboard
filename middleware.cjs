module.exports = (req, res, next) => {
  res.setHeader("Access-Control-Expose-Headers", "X-Total-Count");
  next();
};
