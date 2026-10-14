// A destructure off a realm navigation with an effect buried in a sequence at its root runs the
// effect once ahead of the extraction and re-emits no raw receiver: a bare `globalThis` is a
// ReferenceError on the target engine, and `self` is undefined where the engine has none.
let c = 0;
const { groupBy: viaRootSe } = (c++, globalThis).self.Map;
export const a = viaRootSe;

// ... and so does an effect buried inside the hops
const { groupBy: viaTailSe } = (c++, globalThis.self).Map;
export const b = viaTailSe;
