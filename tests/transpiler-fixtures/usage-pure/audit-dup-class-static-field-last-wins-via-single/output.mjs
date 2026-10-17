import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// a single static field resolves normally (control)
class Single {
  static K = _Map;
}
const groupBy = _Map$groupBy;
export const viaSingle = groupBy([], x => x);