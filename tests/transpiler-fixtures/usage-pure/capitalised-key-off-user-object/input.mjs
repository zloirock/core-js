// A capitalised key read off the user's own object is that object's key, not a built-in surface: the
// nested leaf resolves through the object's type as the lowercase spelling and the flat read do, on
// every host, behind an effect or a member, whatever the key spells. Off the realm, a key naming a
// built-in keeps its own route.
const box = { Data: [1, 2], Text: 'ab', Object: [3], Inner: { List: [4] } };
export const { Data: { at: arrayAt } } = box;
export const { Text: { at: stringAt } } = box;
export const { Object: { keys } } = box;
export const { Inner: { List: { at: deepAt } } } = box;
let assignedAt;
({ Data: { at: assignedAt } } = box);
const loopBox = { Text: 'cd' };
for (const { Text: { at: loopAt } } of [loopBox]) loopAt;
export const { Data: { flat: prefixedFlat } } = (log(), box);
const wrap = { Box: { Text: 'ef' } };
export const { Text: { includes: memberIncludes } } = wrap.Box;
export const { Array: { keys: namespaceKeys } } = globalThis;
export { assignedAt };
