import _Object$groupBy from "@core-js/pure/actual/object/group-by";
// `??` right fallback in the ternary ALTERNATE synth-swaps the same way
let d = Math.random() < 0.5;
let k = null;
let y = {
  Object: {
    groupBy: v => v
  }
};
const {
  Object: {
    groupBy
  }
} = d ? y : k ?? {
  Object: {
    groupBy: _Object$groupBy
  }
};
export const viaNullishRight = groupBy([1, 2], v => v % 2);