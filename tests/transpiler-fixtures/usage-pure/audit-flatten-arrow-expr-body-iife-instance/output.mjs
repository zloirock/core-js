import _Array$from from "@core-js/pure/actual/array/from";
import _valuesMaybeArray from "@core-js/pure/actual/array/instance/values";
const from = _Array$from;
// flatten + sibling arrow EXPRESSION body (not block) requiring _ref. arrow expression
// body's `_ref` goes through scope-tracker's `arrowVars` path (different from block-body
// `scopedVars`). consumeRefBindingsInRange must handle both maps so the arrow body's
// block-conversion overwrite doesn't collide with the parent flatten overwrite
const kls = (() => {
  var _ref;
  return _valuesMaybeArray(_ref = []).call(_ref);
})();
export { from, kls };