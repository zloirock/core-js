import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// an unbraced `var` whose nested leaf flattens keeps every other declarator of that `var`: the
// flattened pair joins the declarator list in place, beside a sibling another route rewrote first,
// and each of two flattened declarators reads its own memo
const box = {
  y: [1, [2]]
};
if (box) var q = 1,
  _ref = box.y,
  afterSibling = _atMaybeArray(_ref),
  afterSiblingFlat = _flatMaybeArray(_ref);
if (box) var staticFirst = _Array$from,
  _ref2 = box.y,
  afterStatic = _atMaybeArray(_ref2),
  afterStaticFlat = _flatMaybeArray(_ref2);
if (box) var _ref3 = box.y,
  one = _atMaybeArray(_ref3),
  oneFlat = _flatMaybeArray(_ref3),
  _ref4 = box.y,
  two = _atMaybeArray(_ref4),
  twoFlat = _flatMaybeArray(_ref4);
export { q, afterSibling, afterSiblingFlat, staticFirst, afterStatic, afterStaticFlat, one, oneFlat, two, twoFlat };