// an SE-bearing sequence prefix inside the kept assignment rides the guard TEST with its own
// polyfills alive, and the value collapses by the shared rule (deepest ponyfillable hop, raw
// tail read) exactly like the unguarded twin
const arr = [1];
let p;
export const guardedSeqPrefixValue = (p = (arr.at(0), globalThis).self.window)?.Map;
