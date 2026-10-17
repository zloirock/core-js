// the same base, reached through the hops a BINDING spells rather than a container read: a write
// that leaves the constructor in the name, a destructured slot, a forwarding IIFE, and a class's
// own static. the negative keeps the bare constructor entry through a hop too - a key the subclass
// declares itself is its own, never inherited
let written;
written = Map;
class ViaWrite extends written {}
use(ViaWrite.groupBy);

const box = { Base: Set, Kept: WeakMap };
const { Base, Kept } = box;
class ViaDestructure extends Base {}
use(ViaDestructure.groupBy);

class ViaForwarder extends (() => Promise)() {}
use(ViaForwarder.allSettled);

class Statics {
  static Base = WeakSet;
}
class ViaClassStatic extends Statics.Base {}
use(ViaClassStatic.groupBy);

class Declares extends Kept {
  static groupBy() { return 1; }
}
use(Declares.groupBy);
