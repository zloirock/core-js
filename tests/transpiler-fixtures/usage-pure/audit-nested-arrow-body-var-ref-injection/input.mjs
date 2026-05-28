// Outer arrow expression body contains an inner arrow expression body; both need a
// `var _ref;` declaration for optional-chain receiver memoization. Each declaration must
// be scoped to its own arrow body and the two body-wraps must compose without the inner
// insert landing inside the outer's edit range. If they don't, the bundler aborts on
// overlapping edits and the file fails to emit.
declare const arr: number[][];
declare const brr: number[][];
const f = () => arr.flat?.().at(0) + ((a: number[][]) => brr.flat?.().at(0))(brr);
export { f };
