var cof = require('./classof-raw');

// `thisNumberValue` abstract operation
// https://tc39.github.io/ecma262/#sec-thisnumbervalue
module.exports = function (value) {
  if (typeof value != 'number' && cof(value) != 'Number') throw TypeError('Incorrect invocation!');
  return +value;
};
