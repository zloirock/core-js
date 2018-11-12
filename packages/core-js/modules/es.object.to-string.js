var toString = require('../internals/object-to-string');

// `Object.prototype.toString` method
// https://tc39.github.io/ecma262/#sec-object.prototype.tostring
if (toString !== ({}).toString) {
  require('../internals/redefine')(Object.prototype, 'toString', toString, { unsafe: true });
}
