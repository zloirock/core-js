import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// a bodyless `var` whose instance read spells its receiver again folds the selection the build decides in
// that copy as in the original: the dispatch reads the operand that runs, and the decided test leaves no
// `Symbol` import
export function pick(ready, list, other, box, make) {
  var _ref;
  if (ready) var at = _at(list);else var flat = _flatMaybeArray(box['a']);
  label: var includes = (_ref = _includes(make(1))) === void 0 ? null : _ref;
  return [at, flat, includes];
}