import _at from "@core-js/pure/actual/instance/at";
// negative case: qualified super wrapped in a TS-cast (`(NS.helper as any)`).
// qualified-segment extraction rejects the cast before resolution reaches segment
// matching, so the extends-binding never resolves to a class shape. Child.at falls
// to generic dispatch -- safer than dispatching against a non-class declaration's
// signature.
namespace NS {
  export function helper(x: string): string[] {
    return [x];
  }
}
class Child extends (NS.helper as any) {}
const arr = Child.notAMethod();
_at(arr).call(arr, 0);