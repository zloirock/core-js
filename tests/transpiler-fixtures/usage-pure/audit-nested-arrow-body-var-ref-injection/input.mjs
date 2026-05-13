// outer arrow expression body contains an inner arrow expression body; both need
// `var _ref;` for `?.` deopt memoization. scope-tracker must wrap each body independently
// and queue both overwrites without one landing inside the other's range. without per-body
// dispatch, an insert at the inner-body position would fall inside the outer overwrite
// and MagicString throws "Cannot split a chunk that has already been edited".
declare const arr: number[][];
declare const brr: number[][];
const f = () => arr.flat?.().at(0) + ((a: number[][]) => brr.flat?.().at(0))(brr);
export { f };
