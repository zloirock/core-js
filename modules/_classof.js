// getting tag from 19.1.3.6 Object.prototype.toString()
var cof = require('./_cof')
  , TAG = require('./_wks')('toStringTag')
  // ES3 wrong here
  , ARG = cof(function(){ return arguments; }()) == 'Arguments';

module.exports = function(it){
  if (it === undefined) {
    return 'Undefined';
  }

  if (it === null) {
    return 'Null';
  }

  var O = Object(it);

  // @@toStringTag case
  if (TAG in O && typeof O[TAG] === 'string') {
    return O[TAG];
  }

  var B = cof(O);

  // builtinTag case
  if (ARG) {
    return B;
  }

  // ES3 arguments fallback
  if (B === 'Object' && typeof O.callee === 'function') {
    return 'Arguments';
  }

  return B;
};
