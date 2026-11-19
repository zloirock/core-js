import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// Effectful static and instance keys are evaluated once before their captured property reads.
// The from and at claims use their own receiver families.
let c1 = 0;
const [{}, _ref] = [Array, {}],
  from = (c1++, _Array$from),
  other = _ref;
// nested-pattern variant with a plus-fold key on an instance method
let c2 = 0;
const arr = [1];
const {
    y: _ref2
  } = {
    y: arr
  },
  at = null == _ref2 ? _ref2[""] : ((c2++, 'a') + 't', _atMaybeArray(_ref2));
export const r = [from, at, other, c1, c2];