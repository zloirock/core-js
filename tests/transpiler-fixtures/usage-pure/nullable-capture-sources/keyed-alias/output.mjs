import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// An aliased optional constructor is checked before the computed key.
const held = _globalThis.window?.Array;
export const from = null == held ? held[""] : (effect(), _Array$from);