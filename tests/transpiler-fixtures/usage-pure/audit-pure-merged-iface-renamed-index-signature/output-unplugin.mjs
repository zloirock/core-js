import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
var _ref, _ref2;
// merged interface, one sibling renames its type-param inside an index signature,
// the other on a named property. per-sibling type-arg subst must reach both shapes
// so any-string-key access resolves to the index-signature value type and named
// access to the renamed property type. at vs includes show which sibling each walked.
interface Foo<T> { [k: string]: T }
interface Foo<U> { otherProp: U }
declare const f: Foo<string[]>;
_atMaybeArray(_ref = f.otherProp).call(_ref, 0);
_includesMaybeArray(_ref2 = f.anyDynamicKey).call(_ref2, "x");