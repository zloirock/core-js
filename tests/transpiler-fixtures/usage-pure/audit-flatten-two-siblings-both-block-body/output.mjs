import _Array$from from "@core-js/pure/actual/array/from";
import _keysMaybeArray from "@core-js/pure/actual/array/instance/keys";
import _valuesMaybeArray from "@core-js/pure/actual/array/instance/values";
// Two sibling block-body IIFEs each need their own `_ref` ; binding consumption must stay scoped per range.
// Cross-pollution would inject `_ref` into the wrong sibling and break both call sites.
const from = _Array$from;
const kls1 = (() => {
  var _ref;
  return _valuesMaybeArray(_ref = []).call(_ref);
})();
const kls2 = (() => {
  var _ref2;
  return _keysMaybeArray(_ref2 = []).call(_ref2);
})();
export { from, kls1, kls2 };