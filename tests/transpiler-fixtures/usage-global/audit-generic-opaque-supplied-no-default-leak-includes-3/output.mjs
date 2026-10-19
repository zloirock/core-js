import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.string.includes";
// A type-param SUPPLIED at the call site but OPAQUE (an unresolvable explicit type-arg, or a present arg the resolver can't type)
// must NOT fall back to its declared default: the default would emit a type-specific Maybe on a foreign runtime receiver (a throw
// on engines without the native method).
type Opaque = {
  z: 1;
};
// channel: user-type instantiation with an explicit opaque type-arg
interface Box<T = number[]> {
  v: T;
}
declare const box: Box<Opaque>;
// @ts-expect-error the member read is the probe, and the right answer is a type without it
box.v.includes(1);