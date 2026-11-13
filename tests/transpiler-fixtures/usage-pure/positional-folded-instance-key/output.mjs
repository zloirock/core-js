import _at from "@core-js/pure/actual/instance/at";
// A proven computed instance key is served after one iterator capture.
const K = 'at';
function* source(value) {
  yield value;
}
const [_ref] = source([3, 7]);
const at = _at(_ref);
export { at };