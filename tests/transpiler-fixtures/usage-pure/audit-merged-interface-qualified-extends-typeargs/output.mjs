import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
var _ref, _ref2;
// merged class+interface; the interface side extends a namespaced parent with type args
namespace NS {
  export interface Container<T> {
    queue: T[];
  }
}
declare class Holder<T> {}
interface Holder<T> extends NS.Container<T> {}
declare const h: Holder<number>;
_atMaybeArray(_ref = h.queue).call(_ref, 0);
_includesMaybeArray(_ref2 = h.queue).call(_ref2, 1);