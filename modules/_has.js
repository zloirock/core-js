var hasOwnProperty = {}.hasOwnProperty;
module.exports = function(it, key){
  try {
    return hasOwnProperty.call(it, key);
  } catch(e){
    return false;
  }
};
