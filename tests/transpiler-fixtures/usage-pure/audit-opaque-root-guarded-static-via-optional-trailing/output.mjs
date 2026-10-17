import _globalThis from "@core-js/pure/actual/global-this";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// optional spellings on the TRAILING dispatch keep their own guards over the collapsed static;
// a NON-polyfillable trailing member rides inside the guarded branch
const p = () => _globalThis;
export const viaOptionalTrailing = null == p().window ? void 0 : _Promise$resolve(4)?.then?.(x => x);