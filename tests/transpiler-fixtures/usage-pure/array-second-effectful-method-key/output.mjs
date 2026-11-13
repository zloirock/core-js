import _includes from "@core-js/pure/actual/instance/includes";
// An omitted first position keeps the effectful claim on the second yielded receiver.
function key() {
  effect();
  return "includes";
}
function* values() {
  yield 0;
  yield "ab";
}
const [, _ref] = values(),
  includes = null == _ref ? _ref[""] : (key(), _includes(_ref));
export { includes };