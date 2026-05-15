// `class Child extends Base` inherits Base's static members at runtime, including
// those contributed by `namespace Base`. resolver walks the super chain (visited-set
// gated) so `Child.build()` correctly resolves via Base's merged namespace export.
// without the parent-walk, `Child.build()` would fall to common dispatch and
// over-inject array.at + string.at on the returned instance
class Base<T> {}
namespace Base {
  export function build<T>(arr: T[]): Base<T> {
    return new Base<T>();
  }
}
class Child<T> extends Base<T> {}

const c = Child.build([1, 2, 3]);
c.at(0);
