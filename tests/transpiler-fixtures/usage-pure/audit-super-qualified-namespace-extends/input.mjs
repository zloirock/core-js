// `class Child extends NS.Base` -- qualified (non-Identifier) super head, which previously
// dropped the inheritance chain at this hop. the segment-walk descent through
// `TSModuleDeclaration` bodies recovers the parent's static method signature, so
// `Child.gather('x')` infers `string[]` and `.at(0)` dispatches the array-specific helper.
namespace NS {
  export class Base {
    static gather(x: string): string[] { return [x]; }
  }
}
class Child extends NS.Base {}
const arr = Child.gather('x');
arr.at(0);
