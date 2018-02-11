var global = require('core-js-internals/global');
var redefine = require('../internals/redefine');
var setGlobal = require('../internals/set-global');

/*
  options.target - name of the target object
  options.global - target is the global object
  options.stat   - export as static methods of target
  options.proto  - export as prototype methods of target
  options.real   - real prototype method for the `pure` version
  options.forced - export even if the native feature is available
  options.bind   - bind methods to the target, required for the `pure` version
  options.wrap   - wrap constructors to preventing global pollution, required for the `pure` version
  options.unsafe - use the simple assignment of property instead of delete + defineProperty
*/
module.exports = function (options, source) {
  var name = options.target;
  var target, key;
  if (options.global) {
    target = global;
  } else if (options.stat) {
    target = global[name] || setGlobal(name, {});
  } else {
    target = (global[name] || {}).prototype;
  }
  if (target) for (key in source) {
    // contains in native
    if (!options.forced && target[key] !== undefined) continue;
    // extend global
    redefine(target, key, source[key], options.unsafe);
  }
};
