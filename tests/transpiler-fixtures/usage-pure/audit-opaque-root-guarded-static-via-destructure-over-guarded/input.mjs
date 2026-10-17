// a DESTRUCTURE over the guarded static extracts through the instance canon: the helper
// receives the GUARDED value and throws on the short-circuited void 0 exactly like native
// destructuring of undefined (faithful-throw)
const dg = () => globalThis;
const { at: pickedAt } = dg()?.window?.Array.of(9);
export const viaDestructureOverGuarded = pickedAt;
