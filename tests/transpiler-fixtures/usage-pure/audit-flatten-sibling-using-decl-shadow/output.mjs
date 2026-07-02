import _Array$from from "@core-js/pure/actual/array/from";
import _valuesMaybeArray from "@core-js/pure/actual/array/instance/values";
// outer flatten of `globalThis` extracts `Array.from`. a sibling IIFE body declares
// `using globalThis = res()` (TC39 explicit-resource-management). per spec `using` is a
// block-scoped lexical binding shadowing the global throughout the body. the sibling-ref
// rewrite must treat `using` / `await using` as lexical, else `[globalThis]` is wrongly aliased
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