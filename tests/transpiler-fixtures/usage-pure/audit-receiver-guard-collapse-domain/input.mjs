// A stored proxy value follows its runtime value: a backed leaf collapses a plain
// middle hop, while a terminal environment probe keeps its slot and guard.
// Static reads, calls and instance trailers follow the same receiver decision;
// each claimed method here has a distinct import-level observable.
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
