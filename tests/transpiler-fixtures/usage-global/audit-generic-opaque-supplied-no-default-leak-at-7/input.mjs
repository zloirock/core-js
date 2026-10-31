// A type-param SUPPLIED at the call site but OPAQUE (an unresolvable explicit type-arg, or a present arg the resolver can't type)
// must NOT fall back to its declared default: the default would emit a type-specific Maybe on a foreign runtime receiver (a throw
// on engines without the native method).
type Opaque = { z: 1; };
declare const opaque: Opaque;
// channel: annotation-domain member chain - a LITERAL arg carries its trivially-known type
// (the inference domain reads declared annotations, so literals needed a keyword bridge);
// an opaque arg through the same chain stays generic
type Wrap<T> = { v: T; };
function wrapOpaque<T = string>(x: T | null): Wrap<T> { return { v: x } as any; }
// @ts-expect-error the member read is the probe, and the right answer is a type without it
wrapOpaque(opaque).v.at(0);
