import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
// an SE buried at an INTERMEDIATE array-wrapper level lifts exactly once and the consumed
// wrapper level is stripped from the residual (`[(se(), [g])]` -> residual reads `[[_g]]`)
let mid = 0;
function midEffect() {
  mid++;
}
midEffect();
const from = _Array$from;
const [[{
  keep
}]] = [[_globalThis]];
// single-level control: the prefix lifts and the consumed wrapper strips the same way
let e1 = 0;
e1++;
const of = _Array$of;
const [{
  tail
}] = [_globalThis];
export const r = [from, of, keep, tail, mid, e1];