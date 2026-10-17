// a dispatch CHAINED over another one memoizes the inner result, so the receiver text that holds
// the navs lives in the OUTER emission rather than in the inner transform. an inner rewrite whose
// range nests inside the already-substituted one still owes that text its render - concluding
// absorption from the enclosure alone left these reads native
globalThis.chainBox = { n: 4, list: ['ab', 'cd'] };
// DEPTH: every added consumer nests one more composition level, and the ordinal that places each
// nav is recomputed at each. five levels and a four-deep ARGUMENT nesting keep that arithmetic
// pinned where a single level would not
export const deepChain = (globalThis.window?.self.chainBox.list, globalThis.window?.self.chainBox.list)
  ?.at(0)?.slice(1).slice(1).slice(1).includes('a');
