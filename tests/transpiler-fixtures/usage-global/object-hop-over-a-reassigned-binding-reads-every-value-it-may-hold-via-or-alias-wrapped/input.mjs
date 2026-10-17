let orRealm = globalThis;
orRealm = window || globalThis;
const [{ AggregateError: viaOrAliasWrapped }] = [orRealm];
export default [viaOrAliasWrapped];
