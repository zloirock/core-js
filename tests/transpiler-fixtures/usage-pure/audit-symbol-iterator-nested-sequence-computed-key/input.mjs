// Nested sequences inside a computed symbol key retain every effect in source order.
// The unchanged source name is read before those effects and needs no capture.
// Iterator consumption folds the symbol lookup after the key effects.
export const a = obj[(0, (probe(), Symbol.iterator))]();
export const b = obj[(first(), (second(), Symbol.iterator))]();
export const c = obj[(0, (1, (deep(), Symbol.iterator)))]();
