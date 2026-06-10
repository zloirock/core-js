import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// multi-key destructure from a conditional with an SE-bearing inline-call branch, ALL keys
// polyfilled: the call is rescued once ahead of the branch literal (the setup still runs on
// the taken branch only), each key gets its polyfill. distinct methods per key
let cond = true;
let c = 0;
const {
  from,
  of
} = cond ? ((() => {
  c++;
  return Array;
})(), {
  from: _Array$from,
  of: _Array$of
}) : {
  from: _Array$from,
  of: _Array$of
};
from([1]);
of(2);