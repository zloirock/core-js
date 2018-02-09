// `Function.prototype.bind` method
// https://tc39.github.io/ecma262/#sec-function.prototype.bind
require('./_export')({ target: 'Function', proto: true }, { bind: require('core-js-internals/function-bind') });
