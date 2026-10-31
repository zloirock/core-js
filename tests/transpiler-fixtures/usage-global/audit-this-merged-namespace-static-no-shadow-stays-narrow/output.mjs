import "core-js/modules/es.array.at";
// Positive counterpart to the merged-namespace static shadow bail: no subclass overrides
// `make`, so the via-`this` narrow off the static merge `namespace Base { make(): number[] }`
// is sound and must be KEPT. `this.make().at(-1)` stays narrowed to the array .at only
// (single es.array.at) - the bail must not fire when no shadow is reachable.
class Base {
  static read() {
    return this.make().at(-1);
  }
}
namespace Base {
  export function make(): number[] {
    return [1, 2, 3];
  }
}
class Sub extends Base {
  static other = 1;
}
Sub.read();