import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Number$MAX_SAFE_INTEGER from "@core-js/pure/actual/number/max-safe-integer";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
import _self from "@core-js/pure/actual/self";
// a collapse that keeps a chain assignment re-emits the assignment around a REBUILT value, and what
// the value's own render copied from the source rides along with it. two things follow, and each row
// asserts one of them: a polyfillable read left inside that copied text still owns its rewrite, and
// the source between the value and the end of the assignment - where a parenthesized value keeps its
// closing token - comes back too, or the file stops parsing.
// both emitters spell the assigned value by ONE rule, the guarded twin's canon: a fully
// ponyfilled navigation spells as the LEAF's own ponyfill (`q = _self`), a realm hop READ THROUGH
// that leaf folds onto it, mid-chain writes survive the
// collapse, and a SEQUENCE-rooted navigation stays root-substituted verbatim (its prefix owns
// live inner rewrites no rebuilt span could carry); the import sets match either way
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

// an unresolvable TAIL hop collapses to the deepest ponyfillable hop and rides the tail read
// raw off it; mid-chain writes survive beside the outer one
export const bareUnresolvableTail = _nameMaybeFunction((q = _self, _Map));
let w;
export const nestedWriteTail = _nameMaybeFunction((q = w = _self, _Map));

// a static VALUE claim consumes the receiver hops above the assignment, leaving the `=` buried
// under them - the collapse must dig it out the same way the effect prelude does, or the value
// keeps a raw hop only in this claim shape while the ctor-read rows above collapse it
export const tailStaticRead = (q = _self, _Number$MAX_SAFE_INTEGER);
export const tailStaticCall = (q = (_Promise$resolve(2), _self), _Array$of)(7);
export const tailFallback = (q = _self, _Promise).noSuchStatic;

// an unresolvable hop BELOW the collapse point keeps its guard - the value the source computes can
// be undefined, and an unguarded leaf would report the global where native short-circuits or throws.
// the sequence prefix rides INSIDE the test with its own polyfills alive, an alias root keeps its name
export const nestedBelowValue = _nameMaybeFunction((q = _self, _Map));
export const nestedBelowSeq = _nameMaybeFunction((q = null == (_atMaybeArray(arr).call(arr, 0), _globalThis).window ? void 0 : _self, _Map));
const alias = _globalThis;
export const nestedBelowAliasSeq = _nameMaybeFunction((q = null == (_atMaybeArray(arr).call(arr, 0), alias).window ? void 0 : _self, _Map));

// the claim needs the value to BE the global, not merely to be rooted at one: a step onto anything
// else leaves a value the source dereferences and throws on, so the member stays where it was
export const nonGlobalSlot = _nameMaybeFunction((q = _globalThis.noSuchSlot).Map);
export const nonGlobalObject = _nameMaybeFunction((q = _globalThis.Math).Map);
export const nonGlobalUnderHop = _nameMaybeFunction((q = (_atMaybeArray(arr).call(arr, 0), _globalThis).noSuchSlot).Map);