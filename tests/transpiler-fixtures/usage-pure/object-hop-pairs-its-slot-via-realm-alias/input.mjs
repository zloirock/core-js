// a binding REASSIGNED between realm names holds one object under several spellings, so a read
// through it answers the same whichever write reached the use - the claim stands
let realmAlias = globalThis;
realmAlias = self;
const { w: { Map: viaRealmAlias } } = { w: realmAlias };
export default [viaRealmAlias];
