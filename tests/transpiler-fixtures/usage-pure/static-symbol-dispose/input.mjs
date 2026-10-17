// a well-known symbol read respells to its pure import: standing alone as a statement it performs nothing and
// leaves, while a value keeps it
Symbol.dispose;
export const symbol = Symbol.dispose;
