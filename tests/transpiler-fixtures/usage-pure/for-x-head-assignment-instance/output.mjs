import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _at from "@core-js/pure/actual/instance/at";
// Assignment heads keep writing their original targets on every iteration.
let at;
for (const _ref of [[1, 2], [3, 4]]) {
  at = _atMaybeArray(_ref);
  consume(at);
}
consume(at);
const target = {};
outer: for (const _ref2 of [[5, 6]]) {
  target.method = _atMaybeArray(_ref2);
  consume(target.method);
  continue outer;
}
for (const _ref3 of unknownRows) {
  at = _at(_ref3);
  consume(at);
}