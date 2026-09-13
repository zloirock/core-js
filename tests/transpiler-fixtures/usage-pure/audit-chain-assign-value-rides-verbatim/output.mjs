import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Number$MAX_SAFE_INTEGER from "@core-js/pure/actual/number/max-safe-integer";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
import _self from "@core-js/pure/actual/self";
// A stored navigation value keeps assignments and rewrites inside its sequence prefix.
// Parenthesized and unparenthesized values collapse to the same backed navigation leaf.
// Source optional checks remain observable; plain middle hops do not invent new guards.
let q;
const arr = [1];

// the value's sequence prefix is copied verbatim, so the calls in it stay polyfilled
export const prefixInstance = _nameMaybeFunction((q = (_atMaybeArray(arr).call(arr, 0), _self), _Map));
export const prefixStatic = _nameMaybeFunction((q = (_Promise$resolve(1), _self), _Map));
export const prefixUnderHop = _nameMaybeFunction((q = (_atMaybeArray(arr).call(arr, 0), _globalThis), _Map));

// a PARENTHESIZED value: the closing token lives past the value's end
export const parenValue = _nameMaybeFunction((q = _self, _Map));
export const parenValueWithPrefix = _nameMaybeFunction((q = (_atMaybeArray(arr).call(arr, 0), _self), _Map));
export const parenValueNested = _nameMaybeFunction((q = _self, _Map));

// negatives: an unparenthesized value has nothing past its end, and a ctor static reached the same
// way keeps the whole shape too
export const bareValue = _nameMaybeFunction((q = _self, _Map));
export const ctorStatic = (q = (_atMaybeArray(arr).call(arr, 0), _self), _Number$MAX_SAFE_INTEGER);

// A plain terminal navigation hop folds onto the deepest backed leaf when consumed.
// Mid-chain stores retain their assignment order.
export const bareUnresolvableTail = _nameMaybeFunction((q = _self, _Map));
let w;
export const nestedWriteTail = _nameMaybeFunction((q = w = _self, _Map));

// a static VALUE claim consumes the receiver hops above the assignment, leaving the `=` buried
// under them - the collapse must dig it out the same way the effect prelude does, or the value
// keeps a raw hop only in this claim shape while the ctor-read rows above collapse it
export const tailStaticRead = (q = _self, _Number$MAX_SAFE_INTEGER);
export const tailStaticCall = (q = (_Promise$resolve(2), _self), _Array$of)(7);
export const tailFallback = (q = _self, _Promise).noSuchStatic;

// A plain middle navigation hop reaches the backed leaf without inventing an optional guard.
// Sequence effects remain inside the stored value, and direct and aliased roots agree.
export const nestedBelowValue = _nameMaybeFunction((q = _self, _Map));
export const nestedBelowSeq = _nameMaybeFunction((q = (_atMaybeArray(arr).call(arr, 0), _self), _Map));
const alias = _globalThis;
export const nestedBelowAliasSeq = _nameMaybeFunction((q = (_atMaybeArray(arr).call(arr, 0), _self), _Map));

// the claim needs the value to BE the global, not merely to be rooted at one: a step onto anything
// else leaves a value the source dereferences and throws on, so the member stays where it was
export const nonGlobalSlot = _nameMaybeFunction((q = _globalThis.noSuchSlot).Map);
export const nonGlobalObject = _nameMaybeFunction((q = _globalThis.Math).Map);
export const nonGlobalUnderHop = _nameMaybeFunction((q = (_atMaybeArray(arr).call(arr, 0), _globalThis).noSuchSlot).Map);