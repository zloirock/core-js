import "core-js/modules/es.array.at";
import "core-js/modules/es.string.includes";
// a class or a function merged with a namespace of the same name is one binding, inside an outer namespace
// too: the merge never shadows it, so a call through it keeps the type its declaration gives
namespace Outer {
  export class Box {
    static make() {
      return [1, 2];
    }
  }
  export namespace Box {
    export const tag = 1;
  }
  use(Box.make().at(0));
  export function items() {
    return 'ab';
  }
  export namespace items {
    export const tag = 1;
  }
  use(items().includes('a'));
}