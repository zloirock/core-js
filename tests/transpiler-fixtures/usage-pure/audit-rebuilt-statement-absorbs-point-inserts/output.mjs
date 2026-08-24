import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastIndexMaybeArray from "@core-js/pure/actual/array/instance/find-last-index";
import _Array$of from "@core-js/pure/actual/array/of";
// a whole-statement rebuild replaces the subtree its own siblings anchored insertions in,
// and an insertion aimed at the replaced subtree is lost. both channels that place one
// have to route into the rebuild instead: the SE-computed-key inline default lands in the residual
// prop it rewrites, the receiver memo becomes a LEADING declarator of its slot
const obj = {
  recv: [1]
};
let e = 0,
  from,
  o;
let done = false;
function eff() {
  return 0;
}
from = _Array$from;
({
  [(e++, 'of')]: o = _Array$of
} = Array);
for (const _ref = obj.recv, a = _atMaybeArray(_ref), {
    [(eff(), 'findLastIndex')]: _unused
  } = _ref, fli = _findLastIndexMaybeArray(_ref); !done;) done = [fli, a];
export const r = [from, o, done];