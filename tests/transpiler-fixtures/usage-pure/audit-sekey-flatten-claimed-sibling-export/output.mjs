import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref;
// An exported computed-key binding keeps internal receiver temporaries private.
// Its receiver evaluates before its key effect and property read, at the original declaration slot.
// The for-init twin preserves the same order inside the header.
const holder = {
  p: [1, 2, 3]
};
let k = 0;
export const {
    Array: {
      from
    }
  } = {
    Array: {
      from: _Array$from
    }
  },
  fl = (_ref = holder.p, null == _ref ? _ref[""] : (k++, _flatMaybeArray(_ref)));
console.log(from, fl, k);
for (const {
    of2
  } = _globalThis.Array, _ref2 = holder.p, q = null == _ref2 ? _ref2[""] : (k++, _atMaybeArray(_ref2)); k < 0;) console.log(of2, q);