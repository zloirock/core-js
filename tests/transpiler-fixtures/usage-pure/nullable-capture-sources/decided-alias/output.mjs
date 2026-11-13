import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// An alias of a decided selection carries its optional value into later reads.
const held = _globalThis.window?.Array;
export const from = (held.from, _Array$from);