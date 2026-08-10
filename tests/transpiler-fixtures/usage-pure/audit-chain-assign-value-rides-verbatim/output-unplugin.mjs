import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Number$MAX_SAFE_INTEGER from "@core-js/pure/actual/number/max-safe-integer";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
import _self from "@core-js/pure/actual/self";
// a collapse that keeps a chain assignment re-emits the assignment around a REBUILT value, and what
// the value's own render copied from the source rides along with it. two things follow, and each row
// asserts one of them: a polyfillable read left inside that copied text still owns its rewrite, and
// the source between the value and the end of the assignment - where a parenthesized value keeps its
// closing token - comes back too, or the file stops parsing.
// the two emitters do NOT agree on how to spell a proxy navigation sitting in the assigned value -
// one prints the leaf's own ponyfill, the other collapses the redundant hop to the root, and the
// import sets differ accordingly. that disagreement is OPEN, not settled here: these rows assert
// what rides along with the value, and the recorded outputs pin today's spelling on each side
let q;
const arr = [1];

// the value's sequence prefix is copied verbatim, so the calls in it stay polyfilled
export const prefixInstance = _nameMaybeFunction((q = (_atMaybeArray(arr).call(arr, 0), _globalThis), _Map));
export const prefixStatic = _nameMaybeFunction((q = (_Promise$resolve(1), _globalThis), _Map));
export const prefixUnderHop = _nameMaybeFunction((q = ((_atMaybeArray(arr).call(arr, 0), _globalThis)), _Map));

// a PARENTHESIZED value: the closing token lives past the value's end
export const parenValue = _nameMaybeFunction((q = (_globalThis), _Map));
export const parenValueWithPrefix = _nameMaybeFunction((q = ((_atMaybeArray(arr).call(arr, 0), _globalThis)), _Map));
export const parenValueNested = _nameMaybeFunction((q = ((_globalThis)), _Map));

// negatives: an unparenthesized value has nothing past its end, and a ctor static reached the same
// way keeps the whole shape too
export const bareValue = _nameMaybeFunction((q = _globalThis, _Map));
export const ctorStatic = (q = (_atMaybeArray(arr).call(arr, 0), _self), _Number$MAX_SAFE_INTEGER);

// the claim needs the value to BE the global, not merely to be rooted at one: a step onto anything
// else leaves a value the source dereferences and throws on, so the member stays where it was
export const nonGlobalSlot = _nameMaybeFunction((q = _globalThis.noSuchSlot).Map);
export const nonGlobalObject = _nameMaybeFunction((q = _globalThis.Math).Map);
export const nonGlobalUnderHop = _nameMaybeFunction((q = (_atMaybeArray(arr).call(arr, 0), _globalThis).noSuchSlot).Map);