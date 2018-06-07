var global = require('../internals/global');
var hide = require('../internals/hide');
var redefine = require('../internals/redefine');
var setGlobal = require('../internals/set-global');
var copyConstructorProperties = require('../internals/copy-constructor-properties');

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
  options.sham   - add a flag to not completely full polyfills
*/
module.exports = function (options, source) {
  var TARGET = options.target;
  var target, key, targetProperty, sourceProperty;
  if (options.global) {
    target = global;
  } else if (options.stat) {
    target = global[TARGET] || setGlobal(TARGET, {});
  } else {
    target = (global[TARGET] || {}).prototype;
  }
  if (target) for (key in source) {
    targetProperty = target[key];
    sourceProperty = source[key];
    // contained in target
    if (!options.forced && targetProperty !== undefined) {
      if (typeof sourceProperty === typeof targetProperty) continue;
      copyConstructorProperties(sourceProperty, targetProperty);
    }
    // add a flag to not completely full polyfills
    if (options.sham || (targetProperty && targetProperty.sham)) {
      hide(sourceProperty, 'sham', true);
    }
    // extend global
    redefine(target, key, sourceProperty, options.unsafe);
  }
};
