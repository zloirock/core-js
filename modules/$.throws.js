module.exports = function(exec){
  try {
    exec();
    return false;
  } catch(e){
    return true;
  }
};