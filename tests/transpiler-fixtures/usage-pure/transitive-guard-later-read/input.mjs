// The Promise static is read before an unrelated lookup in the same guard cycle.
// Pure mode can call the Promise static directly.
let a = Array, b = Map, c = Promise;
if (!b) if (!c) a = OtherArray;
if (!a) b = OtherMap;
if (!b) c = Service;
export const value = c.resolve(1);
export const unused = a.unrelated;
