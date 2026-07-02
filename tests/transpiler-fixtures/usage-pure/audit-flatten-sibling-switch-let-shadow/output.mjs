import _Array$from from "@core-js/pure/actual/array/from";
import _valuesMaybeArray from "@core-js/pure/actual/array/instance/values";
// outer flatten of `globalThis` extracts `Array.from`. a sibling IIFE has a switch with
// `let globalThis` in a case body. ES spec: one shared block scope across cases, so the
// let shadows the outer global throughout the switch. the sibling-ref rewrite must treat
// SwitchStatement as block scope, else `[globalThis].values()` is wrongly aliased to `_globalThis`
const from = _Array$from;
const val = function (kind) {
  var _ref, _ref2;
  switch (kind) {
    case 'a':
      let globalThis = 'shadow';
      return _valuesMaybeArray(_ref = [globalThis]).call(_ref);
    default:
      return _valuesMaybeArray(_ref2 = []).call(_ref2);
  }
}('a');
export { from, val };