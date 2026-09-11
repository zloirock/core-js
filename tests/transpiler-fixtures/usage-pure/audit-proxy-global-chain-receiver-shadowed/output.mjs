import _includes from "@core-js/pure/actual/instance/includes";
// shadowed proxy-global - the parameter binding makes `globalThis` a local value, not the
// runtime root. polyfill must NOT substitute the leaf since the user's value is whatever
// caller passes; only the polyfillable instance method `.includes` gets emitted
function fn(globalThis) {
  var _ref;
  return null == (_ref = globalThis?.foo) ? void 0 : _includes(_ref).call(_ref, 1);
}