// The middle alias may be null, so the write can replace Promise with a foreign receiver.
// Global mode keeps the native calls and supplies their dependencies.
let a = Array, b = pick ? Map : null, c = Promise;
if (!b) if (!c) a = OtherArray;
if (!a) b = OtherMap;
if (!b) c = Service;
export const unused = a.unrelated;
export const value = c.resolve(1);
