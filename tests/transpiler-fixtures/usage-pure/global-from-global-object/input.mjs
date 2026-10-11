// a global read off a realm proxy collapses to the global's constructor import: standing alone as a statement it
// performs nothing and leaves, while a `typeof` read keeps it
globalThis.Map;
self.Promise;
export const kinds = [typeof globalThis.Map, typeof self.Promise];
