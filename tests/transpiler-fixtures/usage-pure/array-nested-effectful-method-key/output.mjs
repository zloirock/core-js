import _at from "@core-js/pure/actual/instance/at";
// A nested iterator position owns the method receiver and keeps the key once.
function key() {
  effect();
  return "at";
}
function* values() {
  yield [[7, 8]];
}
const [[_ref]] = values(),
  at = null == _ref ? _ref[""] : (key(), _at(_ref));
export { at };