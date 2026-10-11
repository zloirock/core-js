import _globalThis from "@core-js/pure/actual/global-this";
// a bare `globalThis` read respells to its pure import: standing alone as a statement it performs nothing and
// leaves, while a value keeps it

export const realm = _globalThis;