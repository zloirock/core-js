import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// a class evaluates every computed KEY before any static block, so a key read of an alias the
// block writes runs pre-assignment and native throws there - whatever the source order says. the
// registered write's span ends before the read textually, and an offset gate alone erases that
// throw: the key read keeps the runtime ctor guard, while the field below the block still narrows
let M;
class C {
  static {
    M = _Map;
  }
  static [((M === _Map ? _Map$groupBy : M.groupBy.bind(M))([1], x => x), 'k')]() {}
  static below = _Map$groupBy([2], x => x);
}
export default C;