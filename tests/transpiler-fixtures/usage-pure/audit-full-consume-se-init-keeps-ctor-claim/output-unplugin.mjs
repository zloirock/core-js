import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Object$values from "@core-js/pure/actual/object/values";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _Promise$any from "@core-js/pure/actual/promise/any";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Reflect from "@core-js/pure/actual/reflect/namespace";
import _Reflect$ownKeys from "@core-js/pure/actual/reflect/own-keys";
import _Symbol$asyncIterator from "@core-js/pure/actual/symbol/async-iterator";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
// a fully-consumed destructure whose init carries side effects LIFTS that init verbatim as a
// standalone statement, so the init's own whole-ctor claim must stay live: suppressing it left the
// proxy-global root under it visitable and the lift polyfilled the ROOT instead of the constructor,
// reading a raw native off it and importing the wrong entry. a leaf with no ctor entry keeps the
// root swap (no ctor import), and an effect-free init still drops whole
let e1 = 0;
(e1++, _Map);
const groupBy = _Map$groupBy;
export const r1 = [typeof groupBy, e1];
let e2 = 0;
(e2++, _Promise);
const allSettled = _Promise$allSettled;
export const r2 = [typeof allSettled, e2];
let e3 = 0;
_globalThis[(e3++, 'Object')];
const values = _Object$values;
export const r3 = [typeof values, e3];
let e4 = 0;
let any;
(e4++, _Promise);
any = _Promise$any;
export const r4 = [typeof any, e4];
let e5 = 0;
for (const _ref = (e5++, _Reflect), ownKeys = _Reflect$ownKeys; false; ) break;
export const r5 = [e5];
let e6 = 0;
(e6++, (e6++, _Symbol));
const asyncIterator = _Symbol$asyncIterator;
export const r6 = [typeof asyncIterator, e6];
const fromEntries = _Object$fromEntries;
export const r7 = [typeof fromEntries];