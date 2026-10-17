import _Object$freeze from "@core-js/pure/actual/object/freeze";
// a static read of `Object.freeze` respells to its pure import: standing alone as a statement it performs nothing
// and leaves, while a value keeps it

export const freeze = _Object$freeze;