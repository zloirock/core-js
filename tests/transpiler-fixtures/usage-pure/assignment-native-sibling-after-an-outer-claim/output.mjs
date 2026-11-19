import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// A nested native pattern reads before its instance claim, even after the preceding
// outer claim has been extracted. Both methods retain their own source reads.
function read(box) {
  var _ref;
  let includes, q, at;
  includes = _includes(box);
  _ref = box.y;
  ({
    other: {
      q
    }
  } = _ref), at = _at(_ref);
  return [includes, q, at];
}
export { read };