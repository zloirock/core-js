// the DESTRUCTURE-source shape of the same kept root: however an emitter renders the root, it
// must swap the kept value's OWN raw root and nothing else, or the assignment leaks an
// unpolyfilled `globalThis`
let d;
export const { of: ofKeptRoot } = (d = globalThis.window).self.Array;
