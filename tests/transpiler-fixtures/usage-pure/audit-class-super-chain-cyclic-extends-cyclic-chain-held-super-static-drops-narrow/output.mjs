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