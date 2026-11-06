import _Map from "@core-js/pure/actual/map/constructor";
// NEGATIVE: a constructor swap keeps the list it was called with, so a line break inside it adds no
// argument either
export const built = new _Map();