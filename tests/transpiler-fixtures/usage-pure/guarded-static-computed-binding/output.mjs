import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// A constant computed key names the same guarded static as a plain key.
// Each source slot is read once and keeps its position in the pattern.
let M = pickConstructor();
if (!M) M = Array;
const key = 'of';
const from = M === Array ? _Array$from : M.from,
  method = M === Array ? _Array$of : M.of;
export { from, method };