import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// A sole instance read takes the complete selection; shared reads keep one receiver.
function whole(flag, left, right) {
  const at = _at(flag ? left : right);
  return at;
}
function partial(flag, left, right) {
  const _ref = flag ? left : right;
  const includes = _includes(_ref);
  const {
    length
  } = _ref;
  return [includes, length];
}