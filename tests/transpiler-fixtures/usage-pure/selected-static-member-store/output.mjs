import _Array$from from "@core-js/pure/actual/array/from";
// Capturing a stored constructor must not read the setter target back.
export function read(choice, box) {
  var _ref;
  const A = choice ? Array : null;
  return _ref = box.value = A, null == _ref ? void 0 : _ref === Array ? _Array$from([3]) : _ref.from([3]);
}