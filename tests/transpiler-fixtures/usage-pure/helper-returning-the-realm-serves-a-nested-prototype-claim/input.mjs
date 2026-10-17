// A local helper proven to return the realm stands for it: the nested prototype claim reads the realm's
// constructor, and the call, which runs nothing, leaves with the pattern.
let at5;
function mk() { return globalThis; }
({ Array: { prototype: { at: at5 } } } = mk());
