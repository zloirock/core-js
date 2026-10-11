// the mirror swaps the arm IN PLACE and keeps the level whole, so what a dropping consumer has to refuse
// stays pairable: an INLINE-array spread is a longer literal, and a later spread or a key nothing names
// overrides the mirrored slot exactly as it overrides the source's (last wins). a spread of a BINDING
// shifts the element by a length nothing knows, and a later getter replaces the slot: both stay native
const [{ hasOwn: viaSpreadShift }] = [...[c ? Object : userObj]];
const [, { getOwnPropertyNames: viaSpreadAhead }] = [...[0], c ? Object : userObj];
const { w: { is: viaSpreadLevel } } = { w: c ? Object : userObj, ...more };
const { w: { freeze: viaLaterKey } } = { w: c ? Object : userObj, [k]: 1 };
const [{ isFrozen: viaSpreadAlias }] = [...wrapped];
const { w: { isSealed: viaGetterLast } } = { w: c ? Object : userObj, get w() { return userObj; } };
export { viaSpreadShift, viaSpreadAhead, viaSpreadLevel, viaLaterKey, viaSpreadAlias, viaGetterLast };
