import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
import _JSON$rawJSON from "@core-js/pure/actual/json/raw-json";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Number$isFinite from "@core-js/pure/actual/number/is-finite";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
import _Symbol$for from "@core-js/pure/actual/symbol/for";
// an assignment-form alias write inside an optional chain is conditional exactly when an
// optional hop sits AT or BELOW the slot's host - only then may the write never run. a hop
// strictly RIGHT of the slot cuts after the write already evaluated, so the registration
// keeps full flow-trust (static narrow); guarded shapes keep the runtime constructor check
let AW, IW, MW, PW, SW;

// spine-head computed key evaluates before the later optional hop - static narrow
a[({ Array: AW } = _globalThis)].b?.c;
export const viaKeyBeforeOptional = _Array$of(1, 2);

// call argument of a NON-optional call, cut after - static narrow
f(({ Iterator: IW } = _globalThis))?.next;
export const viaArgBeforeOptional = _Iterator$from(src);

// argument of an OPTIONAL call may never evaluate - guarded
host?.doThing(({ Map: MW } = _globalThis));
export const viaOptionalCallArg = (MW === _Map ? _Map$groupBy : MW.groupBy.bind(MW))(items, tag);

// computed key under an optional member may never evaluate - guarded
a?.[({ Promise: PW } = _globalThis)];
export const viaOptionalMemberKey = (PW === _Promise ? _Promise$allSettled : PW.allSettled.bind(PW))(list);

// deep chain: the call is plain but an optional hop sits below its callee - guarded
a?.b.c(({ Symbol: SW } = _globalThis));
export const viaOptionalSpineArg = (SW === _Symbol ? _Symbol$for : SW.for.bind(SW))(wellKnownKey);

// an optional hop in the HOST's spine guards the key even through deeper composition - guarded
let NK;
a?.b[({ Number: NK } = _globalThis)].c;
export const viaOptionalSpineKey = (NK === Number ? _Number$isFinite : NK.isFinite.bind(NK))(value);

// a logical object is still an unconditionally-reached spine: both arms lead to the member
// access, so the key always evaluates - static narrow
let JK;
(a ?? b)[({ JSON: JK } = _globalThis)].c;
export const viaLogicalSpineKey = _JSON$rawJSON(input);