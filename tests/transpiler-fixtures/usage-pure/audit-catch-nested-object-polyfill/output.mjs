// `catch ({ Array: { from } })` - the outer prop value is itself an ObjectPattern, no shallow
// rest / default / computed key. extraction is intentionally skipped: the leaf `from` is a local
// catch binding (the caught error's `Array.from`, not the global), so no polyfill dispatch reaches
// it; extraction fires only when a shallow prop needs receiver rewrite or is itself a candidate
try {
  // body intentionally empty
} catch ({
  Array: {
    from
  }
}) {
  from([1, 2, 3]);
}