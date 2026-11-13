import _at from "@core-js/pure/actual/instance/at";
// A live element default stays on its iterator position before the method read.
function key() {
  effect();
  return "at";
}
function* values() {
  yield undefined;
}
const [_ref = [7, 8]] = values(),
  at = null == _ref ? _ref[""] : (key(), _at(_ref));
export { at };