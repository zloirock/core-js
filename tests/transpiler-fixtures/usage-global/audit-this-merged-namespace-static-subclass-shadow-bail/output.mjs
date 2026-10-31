import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// `this.make()` inside an inherited static method runs with `this` bound to the calling
// subclass, not lexical Base. The static merge `namespace Base { make(): number[] }` types
// it as number[] (array .at), but Sub shadows `make` with an `any`-returning static method,
// so a Sub.read() call can see a string. The via-`this` narrow off the merged-namespace
// static is unsound: it must widen and emit BOTH es.array.at and es.string.at, not array-only.
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
  static make(): any {
    return 'x';
  }
}
Sub.read();