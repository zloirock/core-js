import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// Shared capture and receiver-default routes preserve independently supported claims.
// Native iteration, source effects and residual bindings stay in order. Instance claims retain their own receivers.
let c1 = 0;
const [{}, _ref] = [Array, {}],
  from = (c1++, _Array$from),
  other = _ref;
let c2 = 0;
const arr = [1];
const {
    y: _ref2
  } = {
    y: arr
  },
  at = null == _ref2 ? _ref2[""] : ((c2++, 'a') + 't', _atMaybeArray(_ref2));
export const r = [from, at, other, c1, c2];