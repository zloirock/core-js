import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _includes from "@core-js/pure/actual/instance/includes";
// a nested leaf in a for-x head reads a SLOT of the element, not the element: where the iterable is
// a literal of object literals the walk descends that slot per element and folds. answering the
// element type instead handed the leaf the plain-object answer, which resolves to no polyfill at
// all - the module went missing and the dispatcher widened. the fold rides the nav that replaces
// the pattern, so the leg that REWRITES its head answers it the same. a cross-family fold answers
// nothing, so both families reach the leaf
const seen = [];
for (const _ref of [{
  y: [1]
}]) {
  let at = _atMaybeArray(_ref.y);
  _pushMaybeArray(seen).call(seen, at);
}
for (const _ref2 of [{
  y: [1]
}, {
  y: 'ab'
}]) {
  let includes = _includes(_ref2.y);
  _pushMaybeArray(seen).call(seen, includes);
}
for (const _ref3 of [{
  x: 1
}]) {
  let map = _mapMaybeArray(_ref3.y);
  _pushMaybeArray(seen).call(seen, map);
}
// ... and a GETTER names the slot through its return, the same reading a flat host gets: the leg
// that rewrites the head resolved nothing here and shipped the claim native
for (const _ref4 of [{
  get y() {
    return [1];
  }
}]) {
  let at = _atMaybeArray(_ref4.y);
  _pushMaybeArray(seen).call(seen, at);
}
export { seen };