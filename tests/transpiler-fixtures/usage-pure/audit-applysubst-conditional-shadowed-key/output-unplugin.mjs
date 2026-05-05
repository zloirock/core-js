import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
var _ref, _ref2;
// Conditional type uses outer K as the substituted parameter, with inner mapped type
// re-binding K via `as`. applySubst should not re-substitute the inner-bound K with
// the outer subst when applying outer typeArgs through the conditional
type ShadowedRenameProbe<K extends string> = K extends 'narrow' ? {
  [InnerKey in 'a' | 'b' as `${ InnerKey }_${ K }`]: number[];
} : never;
declare const narrowed: ShadowedRenameProbe<'narrow'>;
_atMaybeArray(_ref = narrowed['a_narrow']).call(_ref, 0);
_includesMaybeArray(_ref2 = narrowed['b_narrow']).call(_ref2, 1);