// a bare `globalThis` read respells to its pure import: standing alone as a statement it performs nothing and
// leaves, while a value keeps it
globalThis;
export const realm = globalThis;
