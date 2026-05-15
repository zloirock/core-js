// unrelated `namespace Bar` adjacent to `namespace Foo + class Foo` must not bleed.
// scope walk's name matching keys on `TSModuleDeclaration.id.name === 'Foo'`, so
// `namespace Bar { ... }` is skipped during `Foo.build` lookup. positive control:
// `Foo.build()` correctly narrows to user-class type -> no .at polyfill
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