// `String.prototype.repeat` method
// https://tc39.github.io/ecma262/#sec-string.prototype.repeat
require('./_export')({ target: 'String', proto: true }, {
  repeat: require('core-js-internals/string-repeat')
});
