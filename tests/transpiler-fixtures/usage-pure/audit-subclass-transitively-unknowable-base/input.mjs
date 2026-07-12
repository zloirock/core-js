// a class whose base is TRANSITIVELY unknowable (its own `extends` is a mixin call that resolves
// to nothing) must NOT masquerade as a plain Object: the base could be Array / a typed-array, so
// the generic instance polyfill has to reach the subclass too, exactly as it reaches the base
declare function mixin(): any;
class Base extends mixin() {}
class Sub extends Base {}
declare const b: Base;
declare const s: Sub;
export const viaBase = b.at(0);
export const viaSubclass = s.at(0);

// a genuinely base-LESS class IS a plain object -> Object is correct, no polyfill on the subclass
class Plain {}
class PlainSub extends Plain {}
declare const p: PlainSub;
export const viaPlainSubclass = p.at(0);

// a base that resolves to a known container (Array) keeps the array-specific polyfill down the chain
class Arr extends Array {}
class ArrSub extends Arr {}
declare const a: ArrSub;
export const viaArraySubclass = a.at(0);
