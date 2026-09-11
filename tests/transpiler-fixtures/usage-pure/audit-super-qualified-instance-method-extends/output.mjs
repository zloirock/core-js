import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// inherited INSTANCE method through a qualified parent. the super-walk reaches `NS.Base`
// via the qualified-super resolution and reads `.gather`'s return type from there.
// distinct from the static-method fixtures - exercises the non-static member branch, so
// `new Child().gather('x')` narrows to `string[]` and `.at(0)` dispatches the array helper.
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