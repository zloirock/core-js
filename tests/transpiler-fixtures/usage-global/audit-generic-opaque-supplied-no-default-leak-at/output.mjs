import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
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
makeExplicit<Opaque>().at(0);