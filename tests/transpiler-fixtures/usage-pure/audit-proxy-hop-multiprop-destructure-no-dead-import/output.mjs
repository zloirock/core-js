import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _Object$keys from "@core-js/pure/actual/object/keys";
import _Object$values from "@core-js/pure/actual/object/values";
// A multi-prop OBJECT destructure where EVERY property is a polyfillable static off the same proxy-hop
// receiver empties the pattern fully (each prop extracted by its own emit), so the receiver - a SE-sequence
// init's dropped tail, or a plain init that vanishes - injects NO `_globalThis`. covers a SE-prefixed init
// and a plain init. distinct methods so each line's imports are clear; ISOLATED so absent `_globalThis` asserts.
let reads = 0;
reads++;
const arrFrom = _Array$from;
const arrOf = _Array$of;
const objKeys = _Object$keys;
const objValues = _Object$values;
arrFrom([1]);
arrOf(2);
objKeys({});
objValues({});
export { arrFrom, arrOf, objKeys, objValues };