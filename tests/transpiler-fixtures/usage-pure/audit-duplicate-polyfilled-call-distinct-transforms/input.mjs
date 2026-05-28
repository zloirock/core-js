// two identical polyfilled call exprs `arr.flat()` in the same expression. each is a
// separate AST node so the two emissions stay distinct; equal-range deduplication
// only fires when the same [start, end] appears twice (same parsed node), which is
// not the case here. verifies that legitimate repeated method calls at distinct
// source positions don't false-trigger the dedup branch
const a = arr.flat() === arr.flat();
const b = arr.flat() && arr.flat() && arr.findLast(p);
