// Two separate `namespace MyContainer { ... }` blocks merge onto the same class,
// each exporting a different function. Lookup of `build` (only in the first
// namespace) and `create` (only in the second) must both succeed. Both functions
// return `MyContainer<T>`, so `.at(0)` on each result must NOT emit Array#at or
// String#at - both call sites narrow to the user class.
class MyContainer<T> {}
namespace MyContainer {
  export function build<T>(arr: T[]): MyContainer<T> {
    return new MyContainer<T>();
  }
}
namespace MyContainer {
  export function create<T>(value: T): MyContainer<T> {
    return new MyContainer<T>();
  }
}
MyContainer.build([1, 2, 3]).at(0);
MyContainer.create(42).at(0);