import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Map from "@core-js/pure/actual/map/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
// ... and a destructured constructor that hands nothing out keeps the bare constructor entry: a
// `new` callee and a static read are tracked positions the reaching-value walks resolve through.
// a slot paired with a real container VALUE reads no member of the surface, so its own node carries
// whatever escape it has, a mutated slot keeps reading the user's replacement off the native one,
// and a for-of head under a proxy hop answers the tracked position like every flatter spelling
const Map = _Map;
use(new Map());
const S = _Set;
use(_nameMaybeFunction(S));
const ns = {
  WeakMap: _WeakMap
};
const {
  WeakMap: W
} = ns;
use(new W());
_globalThis.Promise = Shim;
const {
  Promise: P
} = _globalThis;
hand(P);
for (const {
  self: {
    Iterator: I
  }
} of [{
  self: {
    Iterator: _Iterator
  }
}]) use(new I());