import _globalThis from "@core-js/pure/actual/global-this";
import _Reflect from "@core-js/pure/actual/reflect/namespace";
let a, b;

// a proxy root buried behind a CHAIN-ASSIGN inside a side-effect sequence: the natural per-id rewrite and the
// shared resolver both skip an assign-rooted chain, so the redundant `.self` hop must drop HERE - else it
// strands a raw `(a = _globalThis).self` read (undefined off-engine). the assignment stays in source order
const destructured = (c++, (a = _globalThis, _globalThis)).Array;
export const x = destructured;

// live-read binding, distinct method, effect + assign preserved ahead of the collapsed root
const liveRead = (d++, b = _globalThis, _Reflect);
export const y = liveRead;