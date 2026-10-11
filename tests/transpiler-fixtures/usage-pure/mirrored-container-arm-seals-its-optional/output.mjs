import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
// a mirrored arm whose read off a static container crosses a `?.` - dead text over the container, which is never
// nullish - reads its other keys past a sealed chain, the spelling the read keeps wherever the `?.` could fire
const box = {
  U: _Map
};
const bb = {
  W: {
    U: _Map
  }
};
export const {
  groupBy,
  prototype
} = _globalThis.c ? {
  groupBy: _Map$groupBy,
  prototype: (box?.U).prototype
} : {
  groupBy: _Object$groupBy,
  prototype: Object.prototype
};
export const {
  groupBy: deepGroupBy,
  prototype: deepPrototype
} = _globalThis.c ? {
  groupBy: _Map$groupBy,
  prototype: (bb?.W.U).prototype
} : {
  groupBy: _Object$groupBy,
  prototype: Object.prototype
};
export const {
  groupBy: innerGroupBy,
  prototype: innerPrototype
} = _globalThis.c ? {
  groupBy: _Map$groupBy,
  prototype: (bb.W?.U).prototype
} : {
  groupBy: _Object$groupBy,
  prototype: Object.prototype
};