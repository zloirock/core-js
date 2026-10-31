import _globalThis from "@core-js/pure/actual/global-this";
import _Promise from "@core-js/pure/actual/promise/constructor";
// A sealed optional receiver must throw after evaluating the surviving key.
// The optional call cannot swallow the member read, and its argument stays skipped.
export const value = (null == _globalThis.window ? void 0 : _Promise)[key(), "noSuchStatic"]?.(argument());