import _Map from "@core-js/pure/actual/map/constructor";
import _Promise from "@core-js/pure/actual/promise/constructor";
// a global read off a realm proxy through `?.` collapses to the global's constructor import like a plain read:
// standing alone as a statement it performs nothing and leaves, while a `typeof` read keeps it

export const kinds = [typeof _Map, typeof _Promise];