require('../../modules/es6.string.iterator');
require('../../modules/es6.array.from');
var arrayfrom = require('../../modules/_core').Array.from;
module.exports = function (arrayLike, mapFn, thisArg) {
  return arrayfrom(arrayLike, mapFn, thisArg);
};
