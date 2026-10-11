import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _Array$of from "@core-js/pure/actual/array/of";
var _ref2, _ref4;
// a capture moves a keyed static's binding into a declarator of its own, and a later sibling reads it
// once that claim registered the static: the call's array result narrows its dispatch - in the same
// declaration and after an exported one - as after a plain statement
function l(t, v) {
  return v;
}
function make() {
  return {
    w: Array,
    v: Array,
    other: 1
  };
}
const _ref = make(),
  {
    w: {
      [l('k', 'from')]: from
    }
  } = {
    w: {
      from: _Array$from
    }
  },
  {
    other
  } = _ref,
  last = _atMaybeArray(_ref2 = from([1, 2])).call(_ref2, -1);
const _ref3 = make(),
  {
    v: {
      [l('k2', 'of')]: of
    }
  } = {
    v: {
      of: _Array$of
    }
  },
  {
    other: rest
  } = _ref3;
export { of, rest };
export const has = _includesMaybeArray(_ref4 = of(1, 2)).call(_ref4, 2);
export { other, last };