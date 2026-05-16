import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// `class Child extends NS.Base` -- qualified super head. `resolveSuperClassPath` previously
// bailed on non-Identifier super, dropping the inheritance chain at this hop. with the
// segment-walk descent through `TSModuleDeclaration` bodies the parent's static method
// signature is recoverable, so `Child.gather('x')` infers `string[]` and `.at(0)` dispatches
// the array-specific helper.
namespace NS {
  export class Base {
    static gather(x: string): string[] {
      return [x];
    }
  }
}
class Child extends NS.Base {}
const arr = Child.gather('x');
_atMaybeArray(arr).call(arr, 0);