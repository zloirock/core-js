import "core-js/modules/es.array.includes";
class Bare {}
class Plain extends Bare {}
// nothing of that name is inherited, so no extraction can rebind anything - the narrow is correct
export function noInheritedInstanceMethodKeepsNarrow() {
  class Bare {}
  class Sub extends Plain {
    static items = [1, 2, 3];
  }
  const held = Sub.prototype.absent;
  return [held, Sub.items.includes("x")];
}