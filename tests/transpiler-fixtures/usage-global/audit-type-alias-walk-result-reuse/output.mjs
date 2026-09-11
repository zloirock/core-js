import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.string.at";
// the alias walk reuses what it already resolved on the same walk, so a shared sub-alias is not
// re-descended once per arm. what may be reused is the question the rows pin: a PARAMETERIZED alias
// answers differently per type argument, so reusing its first answer for a later arm would report an
// array where the source says string - a type-specific helper on a string receiver, which throws. an
// unparameterized alias has one answer and is safe to reuse
type Id<T> = T;
type Plain = string[];
type MixedArms = Id<string[]> | Id<string>;
type SharedArms = Plain | Plain;
declare const mixed: MixedArms;
declare const shared: SharedArms;

// same declaration, arms whose ARGS disagree: no answer may be carried from one arm to the other, so
// the union stays unknowable and the generic helper is the correct one - both legs must be present
export function armsDisagreeOnTypeArgs() {
  return mixed.at(0);
}

// same declaration, no parameters: one answer for every arm, reuse is sound and the narrow holds
export function armsShareUnparameterizedAlias() {
  return shared.includes("x");
}