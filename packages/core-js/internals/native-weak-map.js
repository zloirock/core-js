var nativeFunctionToString = require('../internals/function-to-string');
var WeakMap = require('../internals/global').WeakMap;

module.exports = typeof WeakMap === 'function' && /native code/.test(nativeFunctionToString.call(WeakMap));
