// synth swap must cover every destructured key, not only polyfilled ones. when a sibling
// (e.g. `isArray`) has no pure entry, the synth still emits `isArray: Array.isArray` so
// `f()` still binds a valid value — dropping it would turn `isArray` into `undefined`
function f({ from, isArray, of } = Array) {
  return isArray(from([1, 2])) && of(1);
}
f;
