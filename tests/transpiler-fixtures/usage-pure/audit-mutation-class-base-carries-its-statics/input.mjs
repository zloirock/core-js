// A subclass can hand its inherited statics out through its own binding.
// The base keeps its whole entry, so the inherited read needs no separate static import.
// An own static is not inherited, and an instance-only method is not a class static.
class Inherits extends Map {}
use(Inherits.groupBy);

class ViaSuper extends Set {
  static make() { return super.union(other); }
}
use(ViaSuper);

class Declares extends WeakMap {
  static of() { return 1; }
}
use(Declares.of);
