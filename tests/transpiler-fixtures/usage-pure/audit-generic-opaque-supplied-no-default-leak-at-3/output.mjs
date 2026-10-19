import _at from "@core-js/pure/actual/instance/at";
var _ref;
// A type-param SUPPLIED at the call site but OPAQUE (an unresolvable explicit type-arg, or a present arg the resolver can't type)
// must NOT fall back to its declared default: the default would emit a type-specific Maybe on a foreign runtime receiver (a throw
// on engines without the native method).
type Opaque = {
  z: 1;
};
declare const opaque: Opaque;
// channel: transitive dependent default (U = T) with an opaque earlier param
function makeTransitive<T = number[], U = T>(x: T): U {
  return x as any;
}
// @ts-expect-error the member read is the probe, and the right answer is a type without it
_at(_ref = makeTransitive(opaque)).call(_ref, 0);