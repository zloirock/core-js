import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// inherited INSTANCE method through qualified parent. `findClassMember`'s super-walk
// reaches `NS.Base` via the qualified-super fix and resolves `.gather`'s return type
// from there. distinct code path from the static-method fixtures - exercises the
// `!member.node.static` branch in `findClassMember`.
namespace NS {
  export class Base {
    gather(x: string): string[] {
      return [x];
    }
  }
}
class Child extends NS.Base {}
const arr = new Child().gather('x');
_atMaybeArray(arr).call(arr, 0);