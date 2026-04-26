import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
const from = _Array$from;
// `const { Array: { from }, ...rest } = globalThis` - rest gathers all OTHER own keys,
// the original destructure excludes `Array` from rest. flattening `Array: { from }` into
// `from = _Array$from` and dropping the outer `Array:` key would change runtime semantics:
// `rest.Array` becomes defined post-rewrite. keep `Array: _unused` sentinel in the destructure
// so rest's exclusion semantic survives
const {
  Array: _unused,
  ...rest
} = _globalThis;
export { from, rest };