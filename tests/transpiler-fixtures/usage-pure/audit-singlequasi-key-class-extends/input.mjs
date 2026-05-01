// destructure with computed template-literal key (no interpolation): singleQuasiString
// returns 'Map'. findDestructureKeyForBinding accepts this through staticKeyName
const { [`Map`]: MyMap } = globalThis;
class C extends MyMap {
  static use() {
    return super.groupBy([1, 2, 3], x => x);
  }
}
C.use();
