// a written value reached through a const ALIAS dereferences like any walk hop
const AliasA = Array;
const ca = { k: Object };
ca.k = AliasA;
const { fromAsync: viaAliasValue } = ca.k;
export { viaAliasValue };
