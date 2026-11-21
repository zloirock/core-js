import _spliceMaybeArray from "@core-js/pure/actual/array/instance/splice";
// Extracting splice leaves its later use unknown.
const extracted = [[1], [2]];
const m = _spliceMaybeArray(extracted);