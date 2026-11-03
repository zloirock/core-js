import _Array$from from "@core-js/pure/actual/array/from";
import _Object$hasOwn from "@core-js/pure/actual/object/has-own";
// A paired selection uses the common branch mirror without taking ownership of its wrapper.
// Argument effects precede binding keys/defaults; a consumed assignment keeps the selected value.
function read(flag, source) {
  return (([{
    [(mark(), 'from')]: from,
    missing = fallback()
  }], extra) => [from, missing, extra])([(before(), flag ? (Array, {
    "from": _Array$from,
    get missing() {
      return Array.missing;
    }
  }) : source)], after());
}
function captured(flag, source) {
  var _ref, _ref2;
  let hasOwn;
  const held = ([_ref] = _ref2 = [flag ? Object : source], hasOwn = _ref === Object ? _Object$hasOwn : _ref.hasOwn, _ref2);
  return [held, hasOwn];
}
export { read, captured };