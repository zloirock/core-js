import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
var _ref, _ref2;
// an UNANNOTATED accessor must not halt the member walk: declaration merging can supply the type
// from a sibling declaration, and stopping at the untyped accessor degrades to the generic family
class Holder {
  get items() {
    return [];
  }
}
interface Holder {
  items: number[];
}
declare const holder: Holder;
export const first = _atMaybeArray(_ref = holder.items).call(_ref, 0);
interface Typed {
  get names(): number[];
}
declare const typed: Typed;
export const last = _findLastMaybeArray(_ref2 = typed.names).call(_ref2, x => x);