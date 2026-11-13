// The retained pattern reads the constructor static from its literal slot.
// Computed keys, accessors and overrides keep their native evaluation order.
export const effects = [];
const k = String('w');
const { w: { groupBy } } = {
  get w() { effects.push('get'); return Map; },
  [k]: { groupBy: () => 23 },
};
export const r = groupBy([1, 2, 3], value => value % 2);
