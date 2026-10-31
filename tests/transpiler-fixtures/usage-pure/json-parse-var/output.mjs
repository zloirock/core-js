import _JSON$parse from "@core-js/pure/actual/json/parse";
// a static read of `JSON.parse` respells to its pure import: standing alone as a statement it performs nothing and
// leaves, while a value keeps it

export const parse = _JSON$parse;