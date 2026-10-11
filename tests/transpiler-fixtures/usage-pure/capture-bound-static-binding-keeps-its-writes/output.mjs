import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
var _ref2, _ref4;
// a capture moves a keyed static's binding into a declarator of its own with the writes the source
// recorded: a binding written later is not the static any more, so a call off it dispatches generically
function l(t, v) {
  return v;
}
function make() {
  return {
    w: Array,
    other: 1
  };
}
let _ref = make(),
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
  } = _ref;
from = x => 'str';
export const last = _at(_ref2 = from([1, 2])).call(_ref2, -1);
let _ref3 = make(),
  {
    w: {
      [l('k2', 'of')]: of
    }
  } = {
    w: {
      of: _Array$of
    }
  },
  {
    other: rest
  } = _ref3,
  reset = of = x => 'str',
  first = _includes(_ref4 = of(1, 2)).call(_ref4, 's');
export { other, rest, reset, first };