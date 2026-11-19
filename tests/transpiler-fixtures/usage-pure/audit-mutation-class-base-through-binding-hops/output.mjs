import _Map from "@core-js/pure/actual/map";
import _Promise from "@core-js/pure/actual/promise";
import _Set from "@core-js/pure/actual/set";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
import _WeakSet from "@core-js/pure/actual/weak-set";
// the same base, reached through the hops a BINDING spells rather than a container read: a write
// that leaves the constructor in the name, a destructured slot, a forwarding IIFE, and a class's
// own static. the negative keeps the bare constructor entry through a hop too - a key the subclass
// declares itself is its own, never inherited
let written;
written = _Map;
class ViaWrite extends written {}
use(ViaWrite.groupBy);
const box = {
  Base: _Set,
  Kept: _WeakMap
};
const {
  Base,
  Kept
} = box;
class ViaDestructure extends Base {}
use(ViaDestructure.groupBy);
class ViaForwarder extends (() => _Promise)() {}
use(ViaForwarder.allSettled);
class Statics {
  static Base = _WeakSet;
}
class ViaClassStatic extends Statics.Base {}
use(ViaClassStatic.groupBy);
class Declares extends Kept {
  static groupBy() {
    return 1;
  }
}
use(Declares.groupBy);