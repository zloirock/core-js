// A sole nested instance method over a pure member receiver can eliminate its residual and dispatch
// directly on that receiver. With an outer sibling, capture the complete host first, select the
// nested method, then read the sibling from that same capture in source property order.
const { y: { at } } = { y: Array.prototype };
const { p: { flat: m }, q } = { p: Array.prototype, q: 1 };
export const r = [typeof at, typeof m, q];
export const effects = [];
