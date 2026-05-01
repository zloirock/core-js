// TQ-9-30 invariant probe: arrow body holds two identical polyfilled call exprs
// `arr.flat()`. Each is a SEPARATE AST node so transform-queue stores two distinct
// transforms; equal-range merge only fires when same [start, end] appears twice,
// which is not the case here. Verifies invariant doesn't false-trigger on legitimate
// repeated method calls
const a = arr.flat() === arr.flat();
const b = arr.flat() && arr.flat() && arr.findLast(p);
