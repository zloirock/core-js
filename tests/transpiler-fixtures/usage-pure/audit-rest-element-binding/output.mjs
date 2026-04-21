import _Array$from from "@core-js/pure/actual/array/from";
const from = _Array$from;
// `const { from, ...Map } = Array` - `...Map` is rest binding (collects remaining Array own-props).
// resolveBindingToGlobal detects RestElement with argument.name === 'Map' and returns null.
// Map.prototype.get stays local-bound - no polyfill, correct semantics
const {
  from: _unused,
  ...Map
} = Array;
Map.prototype.get;