import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
class Renamed extends _Map {
  static m() {
    const g = _Map$groupBy;
    return g;
  }
}
export const viaRenamed = Renamed.m();