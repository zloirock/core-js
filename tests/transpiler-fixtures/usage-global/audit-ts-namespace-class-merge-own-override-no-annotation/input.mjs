// a subclass overrides a parent-namespace export with its own un-annotated function:
// `namespace Base` declares `build(): string`, while `namespace Sub` redeclares `build`
// returning `[1,2,3]` with no annotation. `Sub.build()` must resolve to Sub's own override
// (return-inference yields number[]), so `.at(0)` emits es.array.at, not the parent's es.string.at.
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
