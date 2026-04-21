// `const { from, ...Map } = Array` - `...Map` is rest binding (collects remaining Array own-props).
// resolveBindingToGlobal detects RestElement with argument.name === 'Map' and returns null.
// Map.prototype.get stays local-bound - no polyfill, correct semantics
const { from, ...Map } = Array;
Map.prototype.get;
