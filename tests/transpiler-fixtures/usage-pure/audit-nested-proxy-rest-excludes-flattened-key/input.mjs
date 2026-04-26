// `const { Array: { from }, ...rest } = globalThis` - rest gathers all OTHER own keys,
// the original destructure excludes `Array` from rest. flattening `Array: { from }` into
// `from = _Array$from` and dropping the outer `Array:` key would change runtime semantics:
// `rest.Array` becomes defined post-rewrite. keep `Array: _unused` sentinel in the destructure
// so rest's exclusion semantic survives
const { Array: { from }, ...rest } = globalThis;
export { from, rest };
