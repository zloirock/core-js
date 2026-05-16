import _at from "@core-js/pure/actual/instance/at";
// negative case: qualified super whose leaf is NOT a class declaration -- `NS.helper` is
// a function, not a class. `findDeclPathBySegments` with `isClassLikeDeclaration` matchType
// MUST bail (returns null) rather than incorrectly accept the function declaration.
// `Child.at` falls to generic dispatch -- safer than dispatching against a non-class
// declaration's signature.
namespace NS {
  export function helper(x: string): string[] {
    return [x];
  }
}
class Child extends (NS.helper as any) {}
const arr = Child.notAMethod();
_at(arr).call(arr, 0);