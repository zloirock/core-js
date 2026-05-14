import _Array$from from "@core-js/pure/actual/array/from";
// Top-level (no bodyless wrap) multi-decl with destructure-SE between siblings.
// every initializer carries an observable side effect so reordering is visible at
// runtime. both plugins used to lift the SE ahead of all declarators (unplugin via
// `parts.unshift(...deferredSEs)`, babel via `deferSideEffect` anchored to the
// original declaration's body index after `trySplitDeclaration` shifted siblings),
// moving `trackB` before `trackA`. fix routes the SE into its consumed slot
// (unplugin: inline into `parts`; babel: split declaration via `replaceWithMultiple`
// around `seStmt`) so order matches original evaluation: trackA -> trackB -> from -> trackC.
const a = (trackA(), 1);
trackB();
const from = _Array$from;
const b = (trackC(), 2);
export { a, from, b };