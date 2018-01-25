var cof = require('core-js-internals/classof-raw');
var TO_STRING_TAG = require('./_wks')('toStringTag');
// ES3 wrong here
var CORRECT_ARGUMENTS = cof(function () { return arguments; }()) == 'Arguments';

// fallback for IE11 Script Access Denied error
var tryGet = function (it, key) {
  try {
    return it[key];
  } catch (e) { /* empty */ }
};

// getting tag from ES6+ `Object.prototype.toString`
module.exports = function (it) {
  var O, tag, result;
  return it === undefined ? 'Undefined' : it === null ? 'Null'
    // @@toStringTag case
    : typeof (tag = tryGet(O = Object(it), TO_STRING_TAG)) == 'string' ? tag
    // builtinTag case
    : CORRECT_ARGUMENTS ? cof(O)
    // ES3 arguments fallback
    : (result = cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : result;
};
