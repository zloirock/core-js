import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// A prefix of the tested window runs once, including when the sealed property read throws.
export const value = typeof (prefix(), (_globalThis.window?.Array).from, _Array$from);