import _Array$from from "@core-js/pure/actual/array/from";
// Top-level (no bodyless wrap) multi-decl with destructure-SE between siblings; every
// initializer carries an observable side effect so reordering is visible at runtime.
// both plugins used to lift the destructure's side effect ahead of all declarators,
// moving `trackB` before `trackA`. fix anchors the side effect into its consumed slot
// so order matches original evaluation: trackA -> trackB -> from -> trackC.
const a = (trackA(), 1);
trackB();
const from = _Array$from;
const b = (trackC(), 2);
export { a, from, b };