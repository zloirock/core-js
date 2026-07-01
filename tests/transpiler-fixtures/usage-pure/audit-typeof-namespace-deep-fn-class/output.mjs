import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
var _ref;
// namespaced function/class lookup: typeof NS.Inner.fn / typeof NS.Inner.Cls
// resolved by walking scopes for the declaration, matching a function-or-class leaf
declare namespace NS {
  namespace Inner {
    function makeArr(): number[];
    class Holder {
      static items: string[];
    }
  }
}
type R = ReturnType<typeof NS.Inner.makeArr>;
declare const r: R;
_atMaybeArray(r).call(r, 0);
type H = typeof NS.Inner.Holder;
declare const h: InstanceType<H>;
_findLastMaybeArray(_ref = h.items).call(_ref, x => true);