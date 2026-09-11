import _valuesMaybeArray from "@core-js/pure/actual/array/instance/values";
// IIFE returning instance method polyfill at top level - control case where no destructure
// flatten queues a full-declaration overwrite. asserts var _ref insert flushes cleanly when
// no outer overwrite covers the IIFE body
const kls = (() => {
  var _ref;
  return _valuesMaybeArray(_ref = []).call(_ref);
})();
export { kls };