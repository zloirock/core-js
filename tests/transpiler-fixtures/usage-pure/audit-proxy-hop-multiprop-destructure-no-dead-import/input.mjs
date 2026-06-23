// A multi-prop OBJECT destructure where EVERY property is a polyfillable static off the same proxy-hop
// receiver empties the pattern fully (each prop extracted by its own emit), so the receiver - a SE-sequence
// init's dropped tail, or a plain init that vanishes - injects NO `_globalThis`. covers a SE-prefixed init
// and a plain init. distinct methods so each line's imports are clear; ISOLATED so absent `_globalThis` asserts.
let reads = 0;
const { from: arrFrom, of: arrOf } = (reads++, globalThis.self.Array);
const { keys: objKeys, values: objValues } = globalThis.self.Object;
arrFrom([1]);
arrOf(2);
objKeys({});
objValues({});
export { arrFrom, arrOf, objKeys, objValues };