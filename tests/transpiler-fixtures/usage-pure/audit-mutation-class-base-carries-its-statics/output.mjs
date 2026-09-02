import _Map from "@core-js/pure/actual/map";
import _Set from "@core-js/pure/actual/set/constructor";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
// a subclass whose OWN NAME is a static receiver reads a static it INHERITS, through a binding no
// reaching-value walk connects back to the base - so the base carries its statics itself and the
// bare constructor entry will not do. the negatives keep that entry: a base whose statics are read
// through `super` inside the body resolves on its own, and a key the subclass DECLARES is its own
class Inherits extends _Map {}
use(Inherits.groupBy);
class ViaSuper extends _Set {
  static make() {
    return super.union(other);
  }
}
use(ViaSuper);
class Declares extends _WeakMap {
  static of() {
    return 1;
  }
}
use(Declares.of);