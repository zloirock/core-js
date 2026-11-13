import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
// A used capture keeps its nullish rejection and original result.
const held = _globalThis.window?.Array;
let of;
export const result = ({} = held, of = _Array$of, held);