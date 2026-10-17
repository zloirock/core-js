import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// ALIAS-rooted probe navs ride the same canon with the alias identifier kept verbatim in
// the guard test; a DEFINED alias nav keeps the hop-drop / ctor-swap collapses
const gAlias = _globalThis;
export const viaAliasKeptLive = null == gAlias.window ? void 0 : _self.Object;