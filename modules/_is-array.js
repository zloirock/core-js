// 7.2.2 IsArray(argument)
var cof = require('core-js-internals/classof-raw');
module.exports = Array.isArray || function isArray(arg) {
  return cof(arg) == 'Array';
};
