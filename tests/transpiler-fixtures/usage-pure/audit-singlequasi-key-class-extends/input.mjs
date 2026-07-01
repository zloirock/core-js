// destructure with computed template-literal key (no interpolation): the single-quasi
// template resolves to 'Map', and the destructure-key lookup accepts it as a static key name
const { [`Map`]: MyMap } = globalThis;
class C extends MyMap {
  static use() {
    return super.groupBy([1, 2, 3], x => x);
  }
}
C.use();
