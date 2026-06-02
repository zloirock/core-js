import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// a qualified `extends IM.Base` reached through a namespace alias (`import IM = M`) must resolve
// the parent class via the path-walker's import-equals branch, so the inherited static return
// (`C.head<string>()` -> `string[]`) narrows `.at` to the array variant
namespace M {
  export class Base {
    static head<T>(): T[];
  }
}
import IM = M;
class C extends IM.Base {}
_atMaybeArray(_ref = C.head<string>()).call(_ref, 0);