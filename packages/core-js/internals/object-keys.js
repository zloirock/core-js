var internalObjectKeys = require('../internals/object-keys-internal');
var enumBugKeys = require('../internals/enum-bug-keys');

// 19.1.2.14 / 15.2.3.14 Object.keys(O)
module.exports = Object.keys || function keys(O) {
  return internalObjectKeys(O, enumBugKeys);
};
