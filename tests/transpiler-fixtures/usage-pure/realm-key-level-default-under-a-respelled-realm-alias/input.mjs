// A realm alias the build has already respelled through its own realm import (`_globalThis`, `_self`) still
// names the realm: where the build serves the key's constructor the level's default is dead and leaves with its
// import, and the mirror spells the read in place exactly as it does over the realm itself, whichever binding
// reaches the alias first.
const realm = globalThis;
const { Map: { groupBy } = Set } = realm;
const host = self;
const { Promise: { allSettled } = WeakSet } = host;
export { groupBy, allSettled };
