// A plain proven call-rooted run reaching backed self lands on that ponyfill, and so does a run whose
// only `?.` reads a realm self-reference past the probe: that `?.` guards nothing.
// A live optional inside the run retains its probe, and an opaque root keeps its source navigation.
// Preserved call arguments must still receive their own polyfills and run exactly once.
const f = () => globalThis;
export const plainRun = f().window.window.self?.Array.of(1).at(0);
export const deadOptionalRun = f().window.window?.self?.Array.of(2).at(0);
export const threeHops = f().window.window.window.self?.Array.of(3).at(0);
export const literalKeyHop = f().window['window'].self?.Array.of(4).at(0);
export const inArgument = String(f().window.window.self?.Array.of(5).at(0));
export const dispatchAbove = f().window.window.self?.Array.of(6).at(0).toString();

// the identifier spelling of the same run is the twin these rows answer to: it folds whole, with
// no guard at all
export const identifierTwin = globalThis.window.window.self?.Array.of(7).at(0);

// NEGATIVE: a live `?.` inside the run keeps its test as the source spells it
export const liveOptionalRun = f()?.window?.window.self?.Array.of(8).at(0);

// NEGATIVE: a call whose argument does work stays, its value discarded ahead of the backed hop
const arr = [1, 2, 3];
export const observedCallRoot = f(arr.at(0)).window.window.self?.Array.of(9).at(0);

// NEGATIVE: a root nothing proves to be the realm keeps its own navigation
const opq = () => ({ window: { window: { self: { Array } } } });
export const opaqueRoot = opq().window.window.self?.Array.of(10).at(0);
