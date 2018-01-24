// 19.2.3.2 / 15.3.4.5 Function.prototype.bind(thisArg, args...)
require('./_export')({ target: 'Function', proto: true }, { bind: require('core-js-internals/function-bind') });
