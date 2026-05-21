// Baseline declaration-merging case: `class MyContainer<T>` merged with
// `namespace MyContainer { export function build<T>(arr: T[]): MyContainer<T> }`.
// `MyContainer.build([1,2,3])` must narrow to the user's `MyContainer<T>`
// instance type, so `.at(0)` on the result must NOT emit Array#at - the user's
// class has no `at` method.
class MyContainer<T> {
  data: T[] = [];
}
namespace MyContainer {
  export function build<T>(arr: T[]): MyContainer<T> {
    const b = new MyContainer<T>();
    b.data = arr;
    return b;
  }
}

const c = MyContainer.build([1, 2, 3]);
c.at(0);
