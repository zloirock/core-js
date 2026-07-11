import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// an SE-computed-key leaf under an ARRAY-wrapped receiver still extracts (the wrapper peel wins
// over the SE-key keep-in-residual dispatch); the key effect runs once in the kept residual
let c1 = 0;
const from = _Array$from;
const [{
  [(c1++, 'from')]: _unused
}, other] = [Array, {}];
// nested-pattern variant with a plus-fold key on an instance method
let c2 = 0;
const arr = [1];
const at = _atMaybeArray(arr);
const {
  y: {
    [(c2++, 'a') + 't']: _unused2
  }
} = {
  y: arr
};
export const r = [from, at, other, c1, c2];