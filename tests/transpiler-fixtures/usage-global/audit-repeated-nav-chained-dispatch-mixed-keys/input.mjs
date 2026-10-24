// a dispatch CHAINED over another one memoizes the inner result, so the receiver text that holds
// the navs lives in the OUTER emission rather than in the inner transform. an inner rewrite whose
// range nests inside the already-substituted one still owes that text its render - concluding
// absorption from the enclosure alone left these reads native
globalThis.chainBox = { n: 4, list: ['ab', 'cd'] };
export const mixedKeys = (globalThis.window?.self.chainBox.n, globalThis.window?.self.chainBox.list)?.at(0);
