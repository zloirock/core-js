let orRealm = globalThis;
orRealm = window || globalThis;
const { w: { Set: viaOrAliasHop } } = { w: orRealm };
export default [viaOrAliasHop];
