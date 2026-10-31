import "core-js/modules/es.array.includes";
class Bare {}
class Plain extends Bare {}
// the same shadow, but no ancestor static exists to extract: nothing can rebind `this`, so the
// narrow is CORRECT and must survive - the array `includes` leg alone
export function shadowAloneKeepsNarrow() {
  class Bare {}
  class Sub extends Plain {
    static items = [1, 2, 3];
  }
  return Sub.items.includes("x");
}