import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.entries";
import "core-js/modules/es.array.flat-map";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.keys";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat-map";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.flat-map";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
import "core-js/modules/esnext.iterator.includes";
import "core-js/modules/web.dom-collections.iterator";
import "core-js/modules/web.dom-collections.entries";
// a `typeof` annotation may name the very binding it annotates, directly or round a pair, and the
// annotation lane's recursion budget is the only thing that ends that loop - so it has to cross
// into the typeof resolution rather than restart there. the member row closes the same loop through
// a qualified chain, and the last row is the control: a non-circular typeof chain still narrows.
// distinct method per line so each row is attributable
declare const selfRef: typeof selfRef;
export const a = selfRef.at(0);
declare const left: typeof right;
declare const right: typeof left;
export const b = left.includes("x");
declare const holder: {
  p: typeof holder.p;
};
export const c = holder.p.flatMap(f);
declare const awaitedSelf: Awaited<typeof awaitedSelf>;
export const d = awaitedSelf.entries();
declare const source: number[];
declare const hop: typeof source;
export const e = hop.keys();