import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// A decided selection carries the throw of the operand it yields.
export const from = ((_globalThis.window?.Array).from, _Array$from);