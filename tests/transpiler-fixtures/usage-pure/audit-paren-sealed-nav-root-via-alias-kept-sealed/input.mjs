// ALIAS-rooted probe navs ride the same canon with the alias identifier kept verbatim in
// the guard test; a DEFINED alias nav keeps the hop-drop / ctor-swap collapses
const gAlias = globalThis;
export const viaAliasKeptSealed = (gAlias.window?.self).Object;
