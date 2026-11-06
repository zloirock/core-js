import _Promise from "@core-js/pure/actual/promise/constructor";
// a global read under a TS `as` cast respells to its constructor import: standing alone as a statement it performs
// nothing and leaves, while a `typeof` read keeps it

export const kind = typeof _Promise;