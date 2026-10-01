import _filterMaybeArray from "@core-js/pure/actual/array/instance/filter";
import _findMaybeArray from "@core-js/pure/actual/array/instance/find";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _at from "@core-js/pure/actual/instance/at";
var _ref, _ref2;
// a union CALLEE is one value with several signatures: convergent arms keep the narrow
declare const convergent: (() => number[]) | (() => number[]);
_includesMaybeArray(_ref = convergent()).call(_ref, 1);

// divergent arms cannot name one family, so the generic helper serves them
declare const divergent: (() => number[]) | (() => string);
_at(_ref2 = divergent()).call(_ref2, 0);

// an Extract / Exclude TARGET that is a union distributes arm by arm
type Kept = Exclude<number[] | string | symbol, string | symbol>;
declare const kept: Kept;
_findMaybeArray(kept).call(kept, z => z === 1);

// a target whose written arguments are all TOP keywords constrains no element
type Picked = Extract<number[] | string, readonly unknown[]>;
declare const picked: Picked;
_filterMaybeArray(picked).call(picked, z => z === 1);