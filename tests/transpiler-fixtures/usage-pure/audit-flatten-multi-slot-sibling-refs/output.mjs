import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// the flatten's per-slot rewrite hint keeps a nested substitution's occurrence count aligned
// with the rebuilt text: TWO consumed receiver slots drop two source occurrences of the name
// before the verbatim sibling, whose own references (several in one initializer) must each
// land on their own occurrence - a drifted ordinal would rename a later occurrence instead
const from = _Array$from;
const groupBy = _Map$groupBy;
const keep = [_globalThis, _globalThis.x];
export { from, groupBy, keep };
let c = 0;
c++;
const of = _Array$of;
const tail = [_globalThis];
export { of, tail };