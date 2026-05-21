// An unrelated `namespace Bar` sits next to the `class Foo` + `namespace Foo`
// pair. Lookup of `Foo.build` must not pick up `Bar.build` (which would point at
// `number[]`). `Foo.build()` must narrow to the user's `Foo` instance, so
// `.at(0)` on the result must NOT emit Array#at - sibling namespace names with
// different identifiers do not bleed into each other.
class Foo {}
namespace Foo {
  export function build(): Foo {
    return new Foo();
  }
}
namespace Bar {
  export function build(): number[] {
    return [];
  }
}
Foo.build().at(0);