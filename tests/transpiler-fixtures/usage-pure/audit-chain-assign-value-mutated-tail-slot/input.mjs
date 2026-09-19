// the TAIL hop's slot is the user's object here: the collapse at the deepest ponyfillable hop
// still spells `_self.window` - the raw tail read goes THROUGH the patched slot and answers the
// user's value, so the collapse stays sound; the guarded twin keeps its guard (the patched slot
// is not a realm self-reference, so hop-dropping below it is off)
globalThis.window = { Map: { name: 'patched' } };
let q;
export const patchedTailRead = (q = globalThis.self.window).Map.name;
export const patchedTailGuarded = (q = globalThis.self.window)?.Map.name;
