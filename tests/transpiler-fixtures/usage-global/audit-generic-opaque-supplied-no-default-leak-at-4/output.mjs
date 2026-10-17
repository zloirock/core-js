import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// A type-param SUPPLIED at the call site but OPAQUE (an unresolvable explicit type-arg, or a present arg the resolver can't type)
// must NOT fall back to its declared default: the default would emit a type-specific Maybe on a foreign runtime receiver (a throw
// on engines without the native method).
type Opaque = {
  z: 1;
};
declare const opaque: Opaque;
// channel: implicit inference default-fill with a present-but-opaque arg
function pickInferred<T, U = string[]>(t: T, u: U): U {
  return u;
}
pickInferred('a', opaque).at(0);