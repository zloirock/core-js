// A sealed or alias-held receiver throws before the static's arguments.
// A live optional keeps the claim and its arguments inside the non-null branch.
const alias = globalThis.window;
export const held = alias.Array.from(argument());
export const live = globalThis.window?.Array.from(argument());
export const sealed = (globalThis.window?.self).Array.from(argument());
export const computed = alias[(key(), 'self')].Array.from(argument());
