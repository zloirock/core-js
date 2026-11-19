import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
// a DISCARDED read whose spine roots in an effectful sequence re-emits WHOLE, the read included -
// the source performed it after the effect, and the member above the sequence is not the dead
// proxy nav the drop gate retires; a read the sequence does not root keeps its trimmed shape
let n = 0;
const holder = {
  M: _Map
};
(n++, holder).M;
const fromHolder = _Map$groupBy;
(n++, _globalThis).Array;
const fromRealm = _Array$from;
n++;
const fromTail = _Object$fromEntries;
use(fromHolder, fromRealm, fromTail);