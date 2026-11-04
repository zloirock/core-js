// The middle alias may be null, so the write can replace Promise with a foreign receiver.
// Pure mode must dispatch on the actual receiver.
let a = Array, b = pick ? Map : null, c = Promise;
if (!b) if (!c) a = OtherArray;
if (!a) b = OtherMap;
if (!b) c = Service;
export const unused = a.unrelated;
export const value = c.resolve(1);
