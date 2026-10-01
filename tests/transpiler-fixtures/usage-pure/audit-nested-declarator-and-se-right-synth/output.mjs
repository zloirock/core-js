import _Array$from from "@core-js/pure/actual/array/from";
// a DECLARATOR with an effectful `&&` init: the flatten cannot discard the expression (the
// effect runs natively on every evaluation), so the mirror swaps ONLY the right operand -
// the effect keeps running in place, a falsy left keeps selecting natively, and the taken
// path gets the polyfill literal
let m = 1;
let c = 0;
const {
  Array: {
    from
  }
} = (c++, m) && {
  Array: {
    from: _Array$from
  }
};
from([1]);