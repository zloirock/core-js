import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
import "core-js/modules/esnext.iterator.includes";
// a type-param SUPPLIED at the call site but OPAQUE (an unresolvable explicit type-arg, or
// a present arg the resolver can't type) must NOT fall back to its declared default: the
// default would emit a type-specific Maybe on a foreign runtime receiver (a throw on
// engines without the native method). every supply channel degrades to the GENERIC helper
// instead; the resolvable controls keep their type-specific precision
type Opaque = {
  z: 1;
};
declare const opaque: Opaque;

// channel: explicit type-arg, present but unresolvable
function makeExplicit<T = number[]>(): T {
  return [] as any;
}
makeExplicit<Opaque>().at(0);
makeExplicit<string[]>().at(0);

// channel: deep param-annotation reference (a union wrapper), arg present but opaque
function fromUnionParam<T = string>(x: T | null): T {
  return x as any;
}
fromUnionParam(new Date()).includes(1);

// channel: transitive dependent default (U = T) with an opaque earlier param
function makeTransitive<T = number[], U = T>(x: T): U {
  return x as any;
}
makeTransitive(opaque).at(0);
makeTransitive('str').includes('s');

// channel: implicit inference default-fill with a present-but-opaque arg
function pickInferred<T, U = string[]>(t: T, u: U): U {
  return u;
}
pickInferred('a', opaque).at(0);

// channel: user-type instantiation with an explicit opaque type-arg
interface Box<T = number[]> {
  v: T;
}
declare const box: Box<Opaque>;
box.v.includes(1);
declare const defaultedBox: Box;
defaultedBox.v.at(0);

// channel: annotation-domain member chain - a LITERAL arg carries its trivially-known type
// (the inference domain reads declared annotations, so literals needed a keyword bridge);
// an opaque arg through the same chain stays generic
type Wrap<T> = {
  v: T;
};
function wrapIt<T = string>(x: T): Wrap<T> {
  return {
    v: x
  } as any;
}
wrapIt('abc').v.at(0);
wrapIt([1, 2]).v.includes(1);
function wrapOpaque<T = string>(x: T | null): Wrap<T> {
  return {
    v: x
  } as any;
}
wrapOpaque(opaque).v.at(0);