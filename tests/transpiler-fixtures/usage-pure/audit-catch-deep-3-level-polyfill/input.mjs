// 3-level nested object pattern in catch param. no shallow rest / default / computed at
// the outer level; leaf `from` is a local catch binding (not a polyfill candidate), so
// the destructure stays inline. extraction would add `_ref` rebinding noise without any
// observable runtime gain
try {
  // body intentionally empty
} catch ({ a: { b: { Array: { from } } } }) {
  from([1]);
}
