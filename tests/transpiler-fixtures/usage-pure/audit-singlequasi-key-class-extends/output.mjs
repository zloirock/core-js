import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// destructure with computed template-literal key (no interpolation): singleQuasiString
// returns 'Map'. findDestructureKeyForBinding accepts this through staticKeyName
const MyMap = _Map;
class C extends MyMap {
  static use() {
    return _Map$groupBy.call(this, [1, 2, 3], x => x);
  }
}
C.use();