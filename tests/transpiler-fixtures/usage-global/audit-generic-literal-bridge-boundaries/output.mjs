import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
import "core-js/modules/esnext.iterator.includes";
// literal-arg annotation bridge boundaries: only trivially-typed literals bridge (objects
// and functions stay opaque - generic); a template with expressions is still a string and
// OVERRIDES a mismatched default; an explicit type-arg wins over the bridge; an array
// literal bridges container precision with an inert element slot
type Wrap<T> = {
  v: T;
};
declare const n: number;
function w<T = number[]>(x: T): Wrap<T> {
  return {
    v: x
  } as any;
}
w({
  a: 1
}).v.at(0);
w(() => 1).v.includes(1);
w(`a${n}b`).v.at(0);
w<string>('abc' as any).v.includes('c');
function ws<T = string>(x: T): Wrap<T> {
  return {
    v: x
  } as any;
}
ws([new Date()]).v.at(0);