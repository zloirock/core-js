import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
var _ref, _ref2;
// merged interface where one sibling places a renamed type-param inside an
// index signature and another sibling places it on a named property. per-sibling
// subst must reach into both shapes so dot-access on any string key resolves to
// the index-signature value type and named-property access resolves to the
// renamed sibling's property type. distinct methods on each receiver line
// (at vs includes) show which sibling each lookup walked through.
interface Foo<T> { [k: string]: T }
interface Foo<U> { otherProp: U }
declare const f: Foo<string[]>;
_atMaybeArray(_ref = f.otherProp).call(_ref, 0);
_includesMaybeArray(_ref2 = f.anyDynamicKey).call(_ref2, "x");