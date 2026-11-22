// A write through the Array alias makes its static available at the later read.
const AliasA = Array;
const ca = { k: Object };
ca.k = AliasA;
const { fromAsync: viaAliasValue } = ca.k;
export { viaAliasValue };
