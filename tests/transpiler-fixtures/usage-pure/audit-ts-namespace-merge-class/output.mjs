import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// Namespace merging: Foo is both a class (runtime) and a namespace (type-only).
// Inside namespace body, `Foo` reference is type-level; usage() uses namespace extension.
class Foo {
  at(i: number) {
    return i;
  }
}
namespace Foo {
  export type Bar = Foo;
}
const z = new Foo();
z.at(0);
const arr = [1, 2, 3];
_atMaybeArray(arr).call(arr, 0);