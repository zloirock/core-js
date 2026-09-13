// A nested instance method with an outer sibling captures the complete host once. The function
// value is rewritten in that initializer, the method dispatch reads the captured nested property,
// and the later sibling reads the same capture. Distinct methods keep the two dispatches
// attributable.
const { y: { at: a }, k } = { y: [() => Map], k: 1 };
const { z: { includes: b }, j } = { z: [() => [1, 2].flat()], j: 2 };
export const r = [a, b, k, j];
