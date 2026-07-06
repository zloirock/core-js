import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
import "core-js/modules/esnext.iterator.includes";
// substitution boundaries around opaque markers: a resolvable sibling keeps precision next
// to a marked one; a PARTIAL explicit list marks only the supplied slot; a default-only
// call still binds its defaults; per-call maps stay isolated; a cyclic function-level
// default with a supplied opaque arg degrades without looping; an indexed-access peek
// falls through untouched
type Opaque = {
  z: 1;
};
declare const opaque: Opaque;
function mix<T, U = number[]>(t: T | null, u: U): U {
  return u;
}
mix(opaque, [1]).at(0);
function partial<T = number[], U = T>(): U {
  return [] as any;
}
partial<Opaque>().includes(1);
function defaultsOnly<U = string[]>(): U {
  return [] as any;
}
defaultsOnly().at(0);
function twice<T = string>(x: T | null): T {
  return x as any;
}
twice(opaque).at(0);
twice('abc').includes('b');
function cyc<T = T[]>(x: T | null): T {
  return x as any;
}
cyc(opaque).at(0);
declare const tup: [string, number];
function head<T extends unknown[]>(t: T): T[0] {
  return t[0];
}
head(tup).includes('q');