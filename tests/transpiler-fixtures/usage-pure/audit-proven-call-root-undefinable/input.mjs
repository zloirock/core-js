// proving WHICH global a call root yields is not proving it yields a DEFINED one: a body that
// navigates to the environment probe is undefined off-window, so a `?.` over such a call is
// load-bearing. erased, the collapse read the ponyfill where the source short-circuits - and the
// plan built on that root rendered a test that dereferences the probe
let n = 0, w;
globalThis.callRootBox = { list: [[1]] };
const provenProbe = () => globalThis.window;
const provenRoot = () => globalThis;

// the `?.` sits directly over the call: it is the only guard the source has
export const probeCallOptional = provenProbe()?.self.callRootBox.list;
export const probeCallSealed = (provenProbe()?.self).callRootBox;
export const probeCallDispatch = provenProbe()?.self.callRootBox.list?.flat();
// a body that short-circuits internally reaches the same verdict through one test
export const shortCircuitBody = (() => globalThis.window?.self)()?.window?.Promise.resolve(4);
// NEGATIVE: the call yields the always-defined root, so its `?.` is dead text and the nav collapses
export const definedCallRoot = provenRoot()?.self.callRootBox.list;
// NEGATIVE: a PLAIN read off the probe-yielding call throws natively, and erasing that throw is the
// ordinary collapse - the guard question is only about a `?.` the emit would drop
export const plainReadOffCall = provenProbe().self.Array?.prototype;
// a SEALED live `?.` over a kept write: the write stores the probe, so the test is the write itself
export const sealedKeptWrite = ((w = globalThis.window)?.self)?.Promise.resolve(1);
export const sealedKeptWriteSeq = ((n++, w = globalThis.window)?.self.window)?.Array.of(5);
// NEGATIVE: the write stores the always-defined root, so the source of undefined is the hop ABOVE it
// and the test keeps that read (`null == (held = _globalThis).window`)
let held;
export const writeStoresRoot = (held = (n++, globalThis))?.window?.self.callRootBox.list?.flat();
export { n, w, held };
