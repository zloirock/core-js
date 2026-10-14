// a probe guard tests the `window` read the first unresolvable `?.` makes, whatever spells the root:
// a second `window` past it is the realm itself and earns no test of its own, and a `?.` over a
// proven root may stay inside the test. a root nothing proves keeps its own `?.` as the test - a
// callee the file assigns conditionally, an optional call link, a call returning a local object.
export const bareRootTwoHops = globalThis.window?.window?.self?.Array.of(1).with(0, 9);
export const optionalRootTwoHops = globalThis?.window?.window?.self?.Array.from([2]).includes(2);
const dr = () => globalThis;
export const provenRootTwoHops = dr()?.window?.window?.self?.Object.values({ v: 3 }).findLast(v => v);
const sr = () => globalThis;
export const provenRootOneHop = sr()?.window?.self?.Object.entries({ e: 4 }).flat();
let maybeFn;
if (globalThis.setTimeout) maybeFn = () => globalThis;
export const conditionalCalleeKeepsGuards = maybeFn?.()?.window?.self?.String.raw({ raw: ['k'] }).padEnd(2);
const provenFn = () => globalThis;
export const optionalCallLinkKeepsGuard = provenFn?.()?.window?.self?.String.fromCodePoint(65).padStart(2);
const opaque = () => ({ window: { self: { Array } } });
export const opaqueRootKeepsGuard = opaque()?.window?.self?.Array.of(7).at(0);
