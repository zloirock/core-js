// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
var toIObject = require('./_to-iobject')
  , getNames  = require('./_').getNames
  , toString  = {}.toString;

var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames
  ? Object.getOwnPropertyNames(window) : [];

var getWindowNames = function(it){
  try {
    return getNames(it);
  } catch(e){
    return windowNames.slice();
  }
};

module.exports.get = function getOwnPropertyNames(it){
  return windowNames && toString.call(it) == '[object Window]' ? getWindowNames(it) : getNames(toIObject(it));
};