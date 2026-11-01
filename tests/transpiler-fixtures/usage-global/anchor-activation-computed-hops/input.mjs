// Each key belongs to its own hop; a proxy's name never substitutes a nested user key.
const proxyKey = 'self', ctorKey = 'Promise', userKey = 'userSlotKey';
const { [proxyKey]: { [ctorKey]: { prototype } } } = globalThis;
let groupBy, at;
({ self: { [userKey]: { groupBy } = Map } } = globalThis);
({ self: { [userKey]: { at } = [1, 2] } } = globalThis);
use(prototype, groupBy, at);

// A used assignment yields the whole receiver, including through a proxy hop.
const mapKey = 'Map';
let usedPrototype;
const kept = ({ self: { Map: { prototype: usedPrototype } } } = globalThis);
const keptComputed = ({ [proxyKey]: { [mapKey]: { prototype: usedPrototype } } } = globalThis);
use(kept, keptComputed, usedPrototype);

let unknown;
const keptUnknown = ({ globalThis: { Array: { unknown } } } = globalThis);
use(typeof unknown);

let hits = 0;
const keptEffects = ({ [(++hits, proxyKey)]: { [(++hits, ctorKey)]: { prototype: usedPrototype } } } = globalThis);
use(keptEffects, usedPrototype, hits);
