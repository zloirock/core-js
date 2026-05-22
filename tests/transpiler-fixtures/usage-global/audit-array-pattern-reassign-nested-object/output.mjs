import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// Nested array+object reassign from a typed RHS: `[{ a }] = data` where
// `data: { a: number[] }[]` narrows `a` to `number[]`, so `a.includes(0)` emits the
// array-instance polyfill.
declare const data: {
  a: number[];
}[];
let a;
[{
  a
}] = data;
a.includes(0);