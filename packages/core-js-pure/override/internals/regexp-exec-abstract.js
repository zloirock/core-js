var isCallable = require('../internals/is-callable');
var classof = require('../internals/classof-raw');

var regexpExec = /./.exec;

// `RegExpExec` abstract operation
// https://tc39.es/ecma262/#sec-regexpexec
module.exports = function (R, S) {
  var exec = R.exec;
  if (isCallable(exec)) {
    var result = exec.call(R, S);
    if (typeof result === 'object') return result;
    throw TypeError('RegExp exec method returned something other than an Object or null');
  }
  if (classof(R) === 'RegExp') return regexpExec.call(R, S);
  throw TypeError('RegExp#exec called on incompatible receiver');
};
