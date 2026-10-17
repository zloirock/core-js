// proving WHICH global a call root yields is not proving it yields a DEFINED one: a body that
// navigates to the environment probe is undefined off-window, so a `?.` over such a call is
// load-bearing. erased, the collapse read the ponyfill where the source short-circuits - and the
// plan built on that root rendered a test that dereferences the probe
let n = 0, w;
globalThis.callRootBox = { list: [[1]] };
// NEGATIVE: the write stores the always-defined root, so the source of undefined is the hop ABOVE it
// and the test keeps that read (`null == (held = _globalThis).window`)
let held;
export const writeStoresRoot = (held = (n++, globalThis))?.window?.self.callRootBox.list?.flat();
export { n };
export { held };
