import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// A fallback must prove its aliased value before discarding null rejection.
const held = _globalThis.window?.Array;
const missing = undefined;
export const {
  [(effect(), "from")]: from
} = missing ?? (null == held ? void 0 : {
  "from": _Array$from
});