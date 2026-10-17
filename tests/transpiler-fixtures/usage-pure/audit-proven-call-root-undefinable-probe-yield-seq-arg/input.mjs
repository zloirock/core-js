// proving WHICH global a call root yields is not proving it yields a DEFINED one: a body that
// navigates to the environment probe is undefined off-window, so a `?.` over such a call is
// load-bearing. erased, the collapse read the ponyfill where the source short-circuits - and the
// plan built on that root rendered a test that dereferences the probe
let n = 0, w;
const provenProbe = () => globalThis.window;
export { n };
export const probeYieldSeqArg = (n++, provenProbe(n++))?.self?.window.Array.of(3).at(0);
