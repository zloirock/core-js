// a presence test by a key no fold names - a parameter's - may ask after any static of `Reflect`, so the
// namespace it tests carries every one, bare or off the realm; a namespace with no entry of its own
// (`Math`) has none to load
function supports(name) { return name in Reflect; }
function realmSupports(name) { return name in globalThis.Reflect; }
function mathSupports(name) { return name in Math; }
export const ownKeys = supports('ownKeys');
export const apply = realmSupports('apply');
export const max = mathSupports('max');
