import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
// ALIAS-rooted probe navs ride the same canon with the alias identifier kept verbatim in
// the guard test; a DEFINED alias nav keeps the hop-drop / ctor-swap collapses
const gAlias = _globalThis;
let cb = 0;
export const viaAliasDefinedCtorSwap = (cb++, _Map);
export { cb };