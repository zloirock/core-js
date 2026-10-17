// Quiet unbound names need no receiver capture. Nested property reads still occur once,
// and the instance extraction and its live leaf default stay available on the first pass.
const known = [1, [2]];
let method, flat;
({ y: { at: method }, z: { flat } } = { y: unknown, z: known });
const [{ y: { includes = makeFallback() } }] = [box];
export { method, flat, includes };
