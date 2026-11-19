// An earlier unrelated read must leave the Promise alias as certain as when resolve is read first.
// Pure mode can call the Promise static directly.
let a = Array, b = Map, c = Promise;
if (!b) if (!c) a = OtherArray;
if (!a) b = OtherMap;
if (!b) c = Service;
export const unused = a.unrelated;
export const value = c.resolve(1);
