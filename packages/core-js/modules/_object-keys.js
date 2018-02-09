// 19.1.2.14 / 15.2.3.14 Object.keys(O)
var internalObjectKeys = require('./_object-keys-internal');
var enumBugKeys = require('./_enum-bug-keys');

module.exports = Object.keys || function keys(O) {
  return internalObjectKeys(O, enumBugKeys);
};
