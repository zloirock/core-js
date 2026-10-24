// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Binding identity, writes and later reads retain their existing inference and ordering.
let realmAlias = globalThis;
realmAlias = self;
const { w: { Map: viaRealmAlias } } = { w: realmAlias };
export default [viaRealmAlias];
