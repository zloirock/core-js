// Conditional type uses outer K as the substituted parameter, with inner mapped type
// re-binding K via `as`. applySubst should not re-substitute the inner-bound K with
// the outer subst when applying outer typeArgs through the conditional
type ShadowedRenameProbe<K extends string> = K extends 'narrow' ? {
  [InnerKey in 'a' | 'b' as `${ InnerKey }_${ K }`]: number[];
} : never;
declare const narrowed: ShadowedRenameProbe<'narrow'>;
narrowed['a_narrow'].at(0);
narrowed['b_narrow'].includes(1);
