import "core-js/modules/es.string.at";
// Conflict between a real `static make()` on the class and an exported `make()` in
// the merged namespace: the class member must win, matching TS semantics. The two
// return types are deliberately distinct - class's `make` returns `string`,
// namespace's returns `number[]` - so the emitted polyfill (only `es.string.at`)
// pins which declaration was used to resolve `Container.make()`.
class Container {
  static make(): string {
    return '';
  }
}
namespace Container {
  export function make(): number[] {
    return [];
  }
}
Container.make().at(0);