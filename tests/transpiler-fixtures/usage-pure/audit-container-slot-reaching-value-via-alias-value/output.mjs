// an aliased written value changes nothing for the bail
const AliasA = Array;
const ca = {
  k: Object
};
ca.k = AliasA;
const {
  fromAsync: viaAliasValue
} = ca.k;
export { viaAliasValue };