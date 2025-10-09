'use strict';
var inspectSource = require('./inspect-source');
var store = require('./shared-store');
var isCallable = require('./is-callable');

if (!isCallable(store.getFunctionProvenance)) {
  // https://tc39.es/ecma262/#prod-NativeFunction
  var NATIVE_CODE_RE = /\)\s*\{\s*\[\s*native\s+code\s*\]\s*\}\s*$/;
  // eslint-disable-next-line es/no-weak-set -- safe
  var CORE_JS_REGISTRY = typeof WeakSet === 'function' ? new WeakSet() : null;
  // eslint-disable-next-line es/no-symbol -- safe
  var CORE_JS_BRAND = typeof Symbol === 'function' ? Symbol('CORE_JS_BRAND') : '__CORE_JS_BRAND__';

  function getFunctionProvenance(fn) {
    return isCoreJs(fn) ? 'core-js' : isNative(fn) ? 'native' : 'external';
  }

  function isNative(fn) {
    return NATIVE_CODE_RE.test(inspectSource(fn));
  }

  function isCoreJs(fn) {
    return CORE_JS_REGISTRY ? CORE_JS_REGISTRY.has(fn) : Boolean(fn[CORE_JS_BRAND]);
  }

  function registerCoreJsFunction(fn) {
    if (isNative(fn)) return;

    if (CORE_JS_REGISTRY) {
      CORE_JS_REGISTRY.add(fn);
    } else {
      fn[CORE_JS_BRAND] = true;
    }
  }

  store.getFunctionProvenance = getFunctionProvenance;
  store.registerCoreJsFunction = registerCoreJsFunction;
}

module.exports = {
  getFunctionProvenance: store.getFunctionProvenance,
  registerCoreJsFunction: store.registerCoreJsFunction
};
