// the same destructured alias with a NON-defaulted consumer folds through the registered
// alias hint - the registration verified the alias shape, so the chain resolves without
// the defaulted-consumer inline
const { self: { Symbol: DestructuredSymbol2 } } = globalThis;
const { iterator: viaDestructuredPlain } = DestructuredSymbol2;
export const d = [7, 8][viaDestructuredPlain];
