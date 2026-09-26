import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _at from "@core-js/pure/actual/instance/at";
var _ref2, _ref3;
// Bodyless loop and conditional assignments keep their captures and method reads inside the
// controlled body. Multiple reads write in source order, so the last one wins for a shared target.
let single;
let shared;
for (const x of xs) {
  var _ref;
  [_ref] = [a];
  single = _flatMaybeArray(_ref);
}
if (cond) {
  [_ref2, _ref3] = [b, c];
  shared = _flatMapMaybeArray(_ref2);
  shared = _at(_ref3);
}
export { single, shared };