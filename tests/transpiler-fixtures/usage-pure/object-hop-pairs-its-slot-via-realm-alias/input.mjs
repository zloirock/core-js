// A reassigned realm alias still supplies its current value to the literal slot.
// The nested Map extraction remains native.
let realmAlias = globalThis;
realmAlias = self;
const { w: { Map: viaRealmAlias } } = { w: realmAlias };
export default [viaRealmAlias];
