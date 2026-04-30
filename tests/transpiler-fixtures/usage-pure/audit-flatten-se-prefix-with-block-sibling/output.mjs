import _Array$from from "@core-js/pure/actual/array/from";
import _valuesMaybeArray from "@core-js/pure/actual/array/instance/values";
// SE prefix on the extracted declarator (`(logCall(), globalThis)`) PLUS sibling block-body
// IIFE with instance method. SE prefix gets lifted to standalone statement; sibling's
// `var _ref;` consumed via the new defer path. exercises both code-paths in single
// fixture - SE prefix lift logic and ref-binding consumption don't conflict
declare function logCall(): void;
logCall();
const from = _Array$from;
const kls = (() => {
  var _ref;
  return _valuesMaybeArray(_ref = []).call(_ref);
})();
export { from, kls };