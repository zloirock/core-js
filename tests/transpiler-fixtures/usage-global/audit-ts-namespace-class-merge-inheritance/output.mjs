// `class Child extends Base` inherits Base's static members at runtime, including
// those contributed by a merged `namespace Base`. `Child.build([1,2,3])` must
// resolve via Base's namespace export and return a `Base<T>` instance, so
// `.at(0)` on that result must NOT emit Array#at or String#at - the user's class
// has no `at`.
class Base<T> {}
namespace Base {
  export function build<T>(arr: T[]): Base<T> {
    return new Base<T>();
  }
}
class Child<T> extends Base<T> {}
const c = Child.build([1, 2, 3]);
c.at(0);