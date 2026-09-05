import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// a nav init that a residual survives is memoized so both readers share ONE read - and an OPTIONAL
// nav is such an init like any other: the `?.` rides inside the memo, and the dispatch and the
// surviving residual read the ref. spelling it twice would fire the hop's getter twice
const box = {
  y: [1, [2]]
};
const single = function () {
  const _ref = box?.y;
  const at = _atMaybeArray(_ref);
  const {
    other
  } = _ref;
  return [at, other];
}();
const chained = function () {
  const deep = {
    y: {
      z: [1, [2]]
    }
  };
  const _ref2 = deep?.y?.z;
  const flat = _flatMaybeArray(_ref2);
  const {
    other
  } = _ref2;
  return [flat, other];
}();
export { single, chained };