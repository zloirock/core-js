// a MINTED guard whose TEST holds a call-rooted run of UNBACKED realm hops (`window.window` -
// nothing pure can land on) rides the shared plan's swap: the proven effect-free call folds onto
// the root ponyfill and the hops stay where the source wrote them. reading the test's own nav as
// a source read a second time left the raw call standing where the other emitter had swapped it
const f = () => globalThis;
export const plainRun = f().window.window.self?.Array.of(1).at(0);
export const deadOptionalRun = f().window.window?.self?.Array.of(2).at(0);
export const threeHops = f().window.window.window.self?.Array.of(3).at(0);
export const literalKeyHop = f().window['window'].self?.Array.of(4).at(0);
export const inArgument = String(f().window.window.self?.Array.of(5).at(0));
export const dispatchAbove = f().window.window.self?.Array.of(6).at(0).toString();

// the IDENTIFIER spelling of the same run is the twin these rows are measured against: its own
// visitor collapses the whole nav, so no guard is minted for it at all
export const identifierTwin = globalThis.window.window.self?.Array.of(7).at(0);

// NEGATIVE: a LIVE `?.` inside the run belongs to the guard channels, so the plan stands down
// and the test keeps the source's own spelling
export const liveOptionalRun = f()?.window?.window.self?.Array.of(8).at(0);

// NEGATIVE: an argument the call OBSERVES has no slot in the swap - the call stays spelled
const arr = [1, 2, 3];
export const observedCallRoot = f(arr.at(0)).window.window.self?.Array.of(9).at(0);

// NEGATIVE: an OPAQUE root proves no global, so the run has nothing to ride
const opq = () => ({ window: { window: { self: { Array } } } });
export const opaqueRoot = opq().window.window.self?.Array.of(10).at(0);
