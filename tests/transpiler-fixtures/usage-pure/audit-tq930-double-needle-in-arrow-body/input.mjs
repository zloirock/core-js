// two identical polyfilled call exprs `arr.flat()` in the same expression. each is a
// separate AST node so transform-queue stores two distinct transforms; equal-range
// merge only fires when the same [start, end] appears twice, which is not the case
// here. verifies the merge invariant doesn't false-trigger on legitimate repeated
// method calls at distinct source positions
const a = arr.flat() === arr.flat();
const b = arr.flat() && arr.flat() && arr.findLast(p);
