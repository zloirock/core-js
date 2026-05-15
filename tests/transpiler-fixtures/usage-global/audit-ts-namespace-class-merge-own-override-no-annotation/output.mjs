import "core-js/modules/es.array.at";
// child class's namespace re-exports `build` WITHOUT explicit return annotation while
// parent's namespace declares a different return type (string). resolver must NOT fall
// through to parent's annotated export - that would emit a polyfill for the wrong
// runtime type. instead, own-namespace match without annotation triggers body-return
// inference (`return [1,2,3]` -> Array), yielding the correct array.at polyfill
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