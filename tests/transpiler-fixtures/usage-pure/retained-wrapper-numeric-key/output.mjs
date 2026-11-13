import _Map from "@core-js/pure/full/map";
// The retained pattern reads the constructor static from its literal slot.
// Computed keys, accessors and overrides keep their native evaluation order.
export const effects = [];
const {
  1: {
    groupBy
  }
} = {
  1: _Map
};
export const r = groupBy([1, 2, 3], value => value % 2);