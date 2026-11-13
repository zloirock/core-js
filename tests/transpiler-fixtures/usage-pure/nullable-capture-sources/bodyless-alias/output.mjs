import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
// A bodyless loop capture rejects absence before evaluating its key.
const held = _globalThis.window?.Array;
let of;
for (; {} = held, effect(), of = _Array$of, false;);