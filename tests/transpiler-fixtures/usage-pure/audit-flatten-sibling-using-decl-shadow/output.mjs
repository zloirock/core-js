import _Array$from from "@core-js/pure/actual/array/from";
import _valuesMaybeArray from "@core-js/pure/actual/array/instance/values";
// outer flatten of `globalThis` extracts `Array.from`. sibling IIFE body declares
// `using globalThis = res()` (TC39 stage-4 explicit-resource-management). per spec
// `using` is block-scoped lexical binding - the local `globalThis` shadows the global
// throughout the IIFE body. inner `[globalThis]` reference must NOT be rewritten to the
// polyfill alias. without `using` / `await using` in `LEXICAL_DECL_KINDS`, the binding
// is invisible to `sibling-receiver ref polyfilling`; inner reference gets wrongly rewritten
const from = _Array$from;
const val = (() => {
  var _ref;
  using globalThis = makeResource();
  return _valuesMaybeArray(_ref = [globalThis]).call(_ref);
})();
declare function makeResource(): {
  [Symbol.dispose](): void;
};
export { from, val };