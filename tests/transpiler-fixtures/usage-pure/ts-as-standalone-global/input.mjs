// a global read under a TS `as` cast respells to its constructor import: standing alone as a statement it performs
// nothing and leaves, while a `typeof` read keeps it
(Promise as any);
export const kind = typeof (Promise as any);
