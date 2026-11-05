import _globalThis from "@core-js/pure/actual/global-this";
import _Iterator from "@core-js/pure/actual/iterator";
import _Map from "@core-js/pure/actual/map";
import _Promise from "@core-js/pure/actual/promise";
import _Set from "@core-js/pure/actual/set";
import _Symbol from "@core-js/pure/actual/symbol";
import _WeakMap from "@core-js/pure/actual/weak-map";
// Escaping constructor values from direct realm patterns retain their full static surface.
// Literal wrappers keep native extraction; nested hops and loop heads preserve their own capture rules.
const Map = _Map;
const S = _Set;
const {
  self: {
    WeakMap
  }
} = {
  self: {
    WeakMap: _WeakMap
  }
};
const Promise = _Promise;
const [{
  WeakSet: W
}] = [_globalThis];
const {
  g: {
    Set: R
  }
} = {
  g: _globalThis
};
export const held = [Map, S, WeakMap, Promise, W, R];
for (const {
  Symbol: Y
} of [{
  Symbol: _Symbol
}]) hand(Y);
for (const {
  self: {
    Iterator: I
  }
} of [{
  self: {
    Iterator: _Iterator
  }
}]) hand(I);