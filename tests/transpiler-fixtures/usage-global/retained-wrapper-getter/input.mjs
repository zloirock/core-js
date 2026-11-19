// The retained pattern reads the constructor static from its literal slot.
// Computed keys, accessors and overrides keep their native evaluation order.
export const effects = [];
const { w: { groupBy } } = { get w() { effects.push('get'); return Map; } };
export const r = groupBy([1, 2, 3], value => value % 2);
