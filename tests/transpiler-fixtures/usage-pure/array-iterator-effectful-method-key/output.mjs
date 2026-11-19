import _at from "@core-js/pure/actual/instance/at";
// Native iteration captures the element before its effectful method key is dispatched.
function key() {
  effect();
  return "at";
}
function* values() {
  yield [7, 8];
}
const [_ref] = values(),
  at = null == _ref ? _ref[""] : (key(), _at(_ref));
export { at };