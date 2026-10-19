import _at from "@core-js/pure/actual/instance/at";
var _ref;
// A type-param SUPPLIED at the call site but OPAQUE (an unresolvable explicit type-arg, or a present arg the resolver can't type)
// must NOT fall back to its declared default: the default would emit a type-specific Maybe on a foreign runtime receiver (a throw
// on engines without the native method).
type Opaque = {
  z: 1;
};
// channel: explicit type-arg, present but unresolvable
function makeExplicit<T = number[]>(): T {
  return [] as any;
}
// @ts-expect-error the member read is the probe, and the right answer is a type without it
_at(_ref = makeExplicit<Opaque>()).call(_ref, 0);