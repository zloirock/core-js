import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// The computed key still runs before the extracted static. Its default cannot run
// once pure supplies the method, so a write in that default cannot widen a later
// array read into a generic array-or-string dispatch.
let list = [1, 2];
const from = (effect(), _Array$from);
export const last = _atMaybeArray(list).call(list, -1);
export { from };