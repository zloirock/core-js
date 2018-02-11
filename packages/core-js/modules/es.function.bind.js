// `Function.prototype.bind` method
// https://tc39.github.io/ecma262/#sec-function.prototype.bind
require('../internals/export')({ target: 'Function', proto: true }, {
  bind: require('../internals/function-bind')
});
