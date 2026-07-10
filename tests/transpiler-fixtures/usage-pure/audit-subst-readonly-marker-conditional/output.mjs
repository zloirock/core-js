import _atMaybeString from "@core-js/pure/actual/string/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// the subst lane stamps `.readonly` like the plain lane: `readonly T[]` reached through
// generic substitution keeps its marker, so a readonly-discriminating conditional picks
// the same branch as the direct spelling - here the FALSE branch (string), where the
// dropped marker used to flip it to an array Maybe on a runtime string (ie:11)
type Inner<A> = A extends number[] ? number[] : string;
type Outer<T> = Inner<readonly T[]>;
declare const x: Outer<number>;
export const viaSubstReadonly = _atMaybeString(x).call(x, 0);

// direct spelling control - same conditional, no substitution
type Direct = readonly number[] extends number[] ? number[] : string;
declare const y: Direct;
export const viaDirectReadonly = _includesMaybeString(y).call(y, 'a');