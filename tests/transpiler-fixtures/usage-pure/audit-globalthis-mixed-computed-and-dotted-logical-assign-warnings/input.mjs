// dotted + computed-string LHS forms in the same file - both must surface their own
// warning so users see one diagnostic per source shape
globalThis.Map ||= {};
globalThis['WeakMap'] ||= {};
