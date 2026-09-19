import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$assign from "@core-js/pure/actual/object/assign";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Object$values from "@core-js/pure/actual/object/values";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
import _Set from "@core-js/pure/actual/set/constructor";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// a sibling declarator reads the flattened receiver's name under a member whose computed key
// needs the full canonical fold - SE-sequence tail, const-alias identifier, string concat,
// template interpolation, and an SE key selecting a static off a known constructor. the
// natural visitor folds each of these and overwrites a span STARTING at the receiver
// identifier, so the sibling receiver substitution must stand down instead of landing a
// competing rewrite inside that overwrite
let c = 0;
const f2 = _Array$from;
const g2 = (c++, _Map$groupBy);
export const r = [typeof f2, typeof g2, c];
const k2 = 'Set';
const o2 = _Array$of;
const S2 = _Set;
export const s = [typeof o2, typeof S2];
const en = _Object$entries;
const P2 = _Promise;
export const p = [typeof en, typeof _Promise$resolve];
const part = 'bol';
const va = _Object$values;
const Y2 = _Symbol;
export const y = [typeof va, typeof _Symbol$iterator];
let d = 0;
const as = _Object$assign;
const fe = (d++, _Object$fromEntries);
export const f = [typeof as, typeof fe, d];