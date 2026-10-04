// An unbound receiver is evaluated once before its nested method reads. Refusing to
// replay that receiver must keep the instance extraction and its live leaf default
// available on the first transformation.
const known = [1, [2]];
let method, flat;
({ y: { at: method }, z: { flat } } = { y: unknown, z: known });
const [{ y: { includes = makeFallback() } }] = [box];
export { method, flat, includes };
