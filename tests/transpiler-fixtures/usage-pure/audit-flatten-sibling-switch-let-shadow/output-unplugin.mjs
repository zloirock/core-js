import _Array$from from "@core-js/pure/actual/array/from";
import _valuesMaybeArray from "@core-js/pure/actual/array/instance/values";
// outer flatten of `globalThis` extracts `Array.from`. sibling IIFE init contains a
// switch with `let globalThis` in case body. ES spec: switch creates one shared block
// scope across cases - let `globalThis` shadows the outer global throughout the switch
// block. case body's `[globalThis].values()` should NOT have its `globalThis` rewritten
// to the polyfill alias `_globalThis`. without `SwitchStatement` in BLOCK_SCOPE_TYPES,
// the let is invisible to `sibling-receiver ref polyfilling`'s walk; the inner reference gets
// rewritten incorrectly to the polyfill binding name
const from = _Array$from;
const val = (function (kind) {
  var _ref, _ref2;
  switch (kind) {
    case 'a':
      let globalThis = 'shadow';
      return _valuesMaybeArray(_ref = [globalThis]).call(_ref);
    default:
      return _valuesMaybeArray(_ref2 = []).call(_ref2);
  }
})('a');
export { from, val };