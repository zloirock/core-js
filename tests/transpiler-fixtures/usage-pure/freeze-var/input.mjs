// a static read of `Object.freeze` respells to its pure import: standing alone as a statement it performs nothing
// and leaves, while a value keeps it
Object.freeze;
export const freeze = Object.freeze;
