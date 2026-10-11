// a static read respells to its pure import: standing alone as a statement it performs nothing and leaves, while
// a value keeps it
Array.from;
Object.entries;
Promise.resolve;
export const statics = [Array.from, Object.entries, Promise.resolve];
