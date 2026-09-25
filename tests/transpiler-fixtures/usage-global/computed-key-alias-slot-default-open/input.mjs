// a computed-key alias written through a pattern slot DEFAULT over an OPAQUE source holds whatever
// that source's slot holds - the default fires only where the slot is undefined - so its key names
// nothing: usage-global injects each constructor's whole family, through a member read and a
// computed-key destructure alike, and usage-pure leaves the native member reads alone and serves the
// destructure off the whole Map family, the entry an unnameable key off a constructor holds
let arrayKey = 'isArray';
[arrayKey = 'fromAsync'] = src;
export const arraySlotDefault = Array[arrayKey]([]);
let objectKey = 'keys';
({ objectKey = 'fromEntries' } = src);
export const objectSlotDefault = Object[objectKey]([]);
let mapKey = 'keys';
[mapKey = 'groupBy'] = src;
const { [mapKey]: viaDestructure } = Map;
export const destructureSlotDefault = viaDestructure;
