// Nested Symbol.iterator pattern values keep inner defaults and their polyfills intact.
// Literal and member receivers preserve property order across sibling properties,
// computed keys, declaration hosts and deeper nested patterns.
// Each receiver is evaluated once and unrelated receiver captures remain independent.

// A literal receiver combines an inner polyfillable default with a sibling property.
const { [Symbol.iterator]: { next = [1].flat() }, other } = [1, 2, 3];
export const viaLiteralDefault = [next, other];
