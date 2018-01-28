var has = require('core-js-internals/has');
var toIndexedObject = require('core-js-internals/to-indexed-object');
var arrayIndexOf = require('./_array-includes')(false);
var hiddenKeys = require('./_hidden-keys');

module.exports = function (object, names) {
  var O = toIndexedObject(object);
  var i = 0;
  var result = [];
  var key;
  for (key in O) !has(hiddenKeys, key) && has(O, key) && result.push(key);
  // Don't enum bug & hidden keys
  while (names.length > i) if (has(O, key = names[i++])) {
    ~arrayIndexOf(result, key) || result.push(key);
  }
  return result;
};
