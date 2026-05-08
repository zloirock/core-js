// `catch ({ Array: { from } })`  -  outer prop value is itself an ObjectPattern, no
// shallow rest / default / computed key. extraction is intentionally skipped: the leaf
// `from` is a local catch binding (catch error's `Array.from`, not the global), so no
// polyfill dispatch reaches it through the catch param. destructure stays inline,
// matching pre-existing semantics where extraction fires only when shallow props need
// receiver rewrite or a shallow-level binding is a polyfill candidate
try {
  // body intentionally empty
} catch ({ Array: { from } }) {
  from([1, 2, 3]);
}
