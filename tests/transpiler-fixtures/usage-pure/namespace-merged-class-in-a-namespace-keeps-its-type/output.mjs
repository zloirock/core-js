import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// a class or a function merged with a namespace of the same name is one binding, inside an outer namespace
// too: the merge never shadows it, so a call through it keeps the type its declaration gives
namespace Outer {
  var _ref, _ref2;
  export class Box {
    static make() {
      return [1, 2];
    }
  }
  export namespace Box {
    export const tag = 1;
  }
  use(_atMaybeArray(_ref = Box.make()).call(_ref, 0));
  export function items() {
    return 'ab';
  }
  export namespace items {
    export const tag = 1;
  }
  use(_includesMaybeString(_ref2 = items()).call(_ref2, 'a'));
}