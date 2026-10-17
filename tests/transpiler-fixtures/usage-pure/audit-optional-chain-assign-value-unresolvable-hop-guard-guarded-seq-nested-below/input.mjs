// an SE-bearing sequence prefix inside the kept assignment rides the guard TEST with its own
// polyfills alive, and the value collapses by the shared rule (deepest ponyfillable hop, raw
// tail read) exactly like the unguarded twin
const arr = [1];
// A plain middle hop lands on its backed leaf, including through a sequence prefix.
// No source optional tests `window`, so the value must not acquire an invented window guard.
// The stored value and the prefix effect follow the same collapse as the inline plain twin.
let nb;
export const guardedSeqNestedBelow = (nb = (arr.at(0), globalThis).window.self)?.Map.length;
