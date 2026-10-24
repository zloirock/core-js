import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _Array$of from "@core-js/pure/actual/array/of";
var _ref2, _ref4;
// a capture moving a `var` or `let` keyed static's binding into a declarator of its own keeps it the
// binding the source declared, not a second write of it: a call off it narrows as off a `const`
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
var _ref = make(),
  {
    v: {
      [l('k', 'of')]: of
    }
  } = {
    v: {
      of: _Array$of
    }
  },
  {
    other
  } = _ref;
export const has = _includesMaybeArray(_ref2 = of(1, 2)).call(_ref2, 2);
let _ref3 = make(),
  {
    w: {
      [l('k2', 'from')]: from
    }
  } = {
    w: {
      from: _Array$from
    }
  },
  {
    other: rest
  } = _ref3;
export const last = _atMaybeArray(_ref4 = from([1, 2])).call(_ref4, -1);
export { other, rest };