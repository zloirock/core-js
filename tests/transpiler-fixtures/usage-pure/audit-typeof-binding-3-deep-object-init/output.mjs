import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// 3-deep typeof through nested object init: the walk passes through two intermediate
// object literals to the final array literal. precision-critical for deep namespace
// shapes
const NS = {
  mod: {
    sub: {
      items: [1, 2, 3]
    }
  }
};
declare const x: typeof NS.mod.sub.items;
_atMaybeArray(x).call(x, 0);