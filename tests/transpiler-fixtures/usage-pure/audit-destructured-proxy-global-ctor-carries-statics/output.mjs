import _Iterator from "@core-js/pure/actual/iterator";
import _Map from "@core-js/pure/actual/map";
import _Promise from "@core-js/pure/actual/promise";
import _Set from "@core-js/pure/actual/set";
import _Symbol from "@core-js/pure/actual/symbol";
import _WeakMap from "@core-js/pure/actual/weak-map";
import _WeakSet from "@core-js/pure/actual/weak-set";
// a constructor DESTRUCTURED off the proxy-global surface escapes exactly as a spelled-out read of
// that surface does: the slot pairs with a member the source never writes, so the pattern SLOT is
// what names the escape. every spelling of the pairing answers alike - shorthand, renamed, nested,
// defaulted, an array wrapper, and a for-of head, whose pattern pairs with the iterated element -
// flat and through a proxy hop, where the level is a synthesized read no position of its own names
const Map = _Map;
const S = _Set;
const WeakMap = _WeakMap;
const Promise = _Promise;
const W = _WeakSet;
const R = _Set;
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