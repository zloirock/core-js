module.exports = function (exec) {
  try {
    return { e: false, v: exec() };
  } catch (error) {
    return { e: true, v: error };
  }
};
