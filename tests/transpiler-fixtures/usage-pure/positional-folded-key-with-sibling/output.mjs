import _at from "@core-js/pure/actual/instance/at";
// A folded instance key and its native sibling share the captured element.
const K = 'at';
function* source(value) {
  yield value;
}
const [_ref] = source([3, 7]);
const at = _at(_ref);
const {
  length
} = _ref;
export { at, length };