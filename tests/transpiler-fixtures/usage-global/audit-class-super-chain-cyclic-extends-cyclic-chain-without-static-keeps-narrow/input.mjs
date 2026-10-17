class Loop extends Knot {}
class Knot extends Loop {}
class Plain extends Loop {}
// the same cycle with no static anywhere in it: nothing rebinds `this`, so the narrow is correct
export function cyclicChainWithoutStaticKeepsNarrow() {
  class Loop {}
  class Sub extends Plain {
    static items = [1, 2, 3];
  }
  return Sub.items.includes("x");
}
