// A TS wrapper around an init a static claim empties leaves with the value it wraps: what stays of the
// init - its effects - is spelled bare, its rescue asked of what the wrapper holds (a prefix keeps its
// effect alone). A declaration, an assignment and a bodyless slot alike. A left the build serves
// (`globalThis.Array`, and `globalThis.Number`, a global core-js extends in place) leaves its right dead.
const { of } = (globalThis.Array || (log(), Set)) as any;
let from: any;
({ from } = (log(), globalThis.Array || Set) as ArrayConstructor);
const { fromEntries } = (log(), globalThis).Object!;
if (ok) var { fromAsync } = (globalThis.Array ?? make()) satisfies unknown;
let hasOwn: any;
if (ok) ({ hasOwn } = (log(), globalThis.Object || Set) as any);
if (ok) var { entries } = (log(), globalThis).Object as any;
export { of, from, fromEntries, fromAsync, hasOwn, entries };
const { isInteger } = (globalThis.Number || (log(), Set)) as any;
if (ok) var { isFinite } = (globalThis.Number ?? make()) satisfies unknown;
export { isInteger, isFinite };
