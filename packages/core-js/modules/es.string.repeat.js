// `String.prototype.repeat` method
// https://tc39.github.io/ecma262/#sec-string.prototype.repeat
require('../internals/export')({ target: 'String', proto: true }, {
  repeat: require('../internals/string-repeat')
});
