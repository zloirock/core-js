// `class Child extends Outer.Inner.Base` -- multi-segment qualified super. tests the
// recursive `walkDeclPathsBySegments` step through nested `TSModuleDeclaration` bodies
// (both flat `TSModuleBlock` form and babel's nested-id form) to land at Base's class
// declaration. parent's static return type still propagates -- `arr` resolves to `string[]`.
namespace Outer {
  export namespace Inner {
    export class Base {
      static gather(x: string): string[] { return [x]; }
    }
  }
}
class Child extends Outer.Inner.Base {}
const arr = Child.gather('x');
arr.at(0);
