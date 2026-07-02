import _Array$from from "@core-js/pure/actual/array/from";
// an assignment-cascade host whose RHS is an effectful `&&`-guarded proxy. the proxy operand is
// mirrored to a synth literal (polyfill bound unconditionally, a buggy native still replaced); the
// effect prefix and the `&&` guard are kept verbatim, so the effect runs once and a falsy guard
// still short-circuits to the native throw
let from;
let c = 0;
let m = 1;
({
  Array: {
    from
  }
} = (c++, m) && {
  Array: {
    from: _Array$from
  }
});
from([1]);