import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _at from "@core-js/pure/actual/instance/at";
// a heritage cycle is a runtime error but parses fine, so the chain walk has to terminate on it by
// itself: without the already-seen check the hop step never runs out of ancestors and the plugin
// spins forever on input a user can very much write. the rows also pin the ANSWER through a cycle -
// the walk must still collect what it reached before folding back, one method each
class Cycle extends Ring {
  static make() {
    this.items = "poison";
    return 1;
  }
}
class Ring extends Cycle {}
class Base extends Cycle {}
class Loop extends Knot {}
class Knot extends Loop {}
class Plain extends Loop {}

// the cycle is walked, the poisoning static is still reached, and the held `super.make` rebinds
// `this` later - the narrow must widen
export function cyclicChainHeldSuperStaticDropsNarrow() {
  var _ref;
  class Cycle {}
  class Sub extends Base {
    static items = [1, 2, 3];
    static grab() {
      return super.make;
    }
  }
  return _at(_ref = Sub.items).call(_ref, 0);
}

// the same cycle with no static anywhere in it: nothing rebinds `this`, so the narrow is correct
export function cyclicChainWithoutStaticKeepsNarrow() {
  var _ref2;
  class Loop {}
  class Sub extends Plain {
    static items = [1, 2, 3];
  }
  return _includesMaybeArray(_ref2 = Sub.items).call(_ref2, "x");
}