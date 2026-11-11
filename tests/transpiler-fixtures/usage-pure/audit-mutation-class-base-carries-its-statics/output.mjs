import _Map from "@core-js/pure/actual/map";
import _Set from "@core-js/pure/actual/set";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
// A subclass can hand its inherited statics out through its own binding.
// The base keeps its whole entry, so the inherited read needs no separate static import.
// An own static is not inherited, and an instance-only method is not a class static.
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