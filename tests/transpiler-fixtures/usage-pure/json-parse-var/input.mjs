// a static read of `JSON.parse` respells to its pure import: standing alone as a statement it performs nothing and
// leaves, while a value keeps it
JSON.parse;
export const parse = JSON.parse;
