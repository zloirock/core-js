// an instance claim the destructure reads off a realm constructor ahead of a write replacing that constructor's
// slot dispatches on the constructor's ponyfill: the read happens before the write - through the realm, through
// an alias of it and through a proxy hop alike
const { Promise: { name: promiseName } } = globalThis;
globalThis.Promise = class PromiseShim {};
const realm = globalThis;
const { Map: { name: mapName } } = realm;
realm.Map = class MapShim {};
const { self: { Set: { name: setName } } } = globalThis;
self.Set = class SetShim {};
export { promiseName, mapName, setName };
