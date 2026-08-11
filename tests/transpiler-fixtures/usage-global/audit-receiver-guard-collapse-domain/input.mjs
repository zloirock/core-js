// what the receiver-guard channel keeps in the KEPT chain-assign value, by hop kind: a navigation
// that IS the value collapses to its last ponyfillable hop, one whose last hop has no pure entry
// keeps the root and reads that hop off it, and one whose UNRESOLVABLE hop sits in the middle
// renders the shared guard plan instead of collapsing through it. the claim behind the guard does
// not change that answer - the three claim shapes below cross it. one static and one instance
// method per line, so a row that stops resolving shows up in the import set too.
let selfPlain, selfPlainB, selfPlainC;
export const lastHopStatic = (selfPlain = globalThis.self)?.Map.groupBy([1, 2], v => v % 2);
export const lastHopValue = (selfPlainB = globalThis.self)?.Object.entries({ a: 1 });
export const lastHopCallTail = (selfPlainC = globalThis.self)?.Array.from([1]).at(0);

let unponyfilled, unponyfilledB, unponyfilledC;
export const rootOnlyStatic = (unponyfilled = globalThis.window)?.Math.hypot(3, 4);
export const rootOnlyValue = (unponyfilledB = globalThis.window)?.Number.parseFloat('1.5');
export const rootOnlyCallTail = (unponyfilledC = globalThis.window)?.String.fromCodePoint(99).endsWith('c');

let midHop, midHopB;
export const guardedPlanStatic = (midHop = globalThis.window.self)?.Reflect.ownKeys({ b: 2 });
export const guardedPlanValue = (midHopB = globalThis.window.self)?.Promise.resolve(1);

let nested;
export const nestedNav = (nested = globalThis.self.window)?.JSON.stringify({ c: 3 });
