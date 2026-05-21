// Subclass overrides a parent-namespace export with its own un-annotated function.
// `namespace Base` declares `build(): string`; `class Sub extends Base` plus
// `namespace Sub { export function build() { return [1,2,3] } }` overrides it
// without an explicit return type. `Sub.build()` must resolve to Sub's own
// override (return-statement inference yields `number[]`), so `.at(0)` must emit
// `es.array.at` - not `es.string.at` from the parent's annotation.
class Base {}
namespace Base {
  export function build(): string {
    return '';
  }
}
class Sub extends Base {}
namespace Sub {
  export function build() {
    return [1, 2, 3];
  }
}

Sub.build().at(0);
