import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
var _ref, _ref2;
// interface extending a 3-segment qualified name; the namespace walker must resolve via
// full segment path, not just the last segment, so a sibling-scope decl with the same
// short name doesn't shadow
namespace NS {
  export namespace Inner {
    export interface Base {
      data: number[];
    }
  }
}
interface Sub extends NS.Inner.Base {}
declare const s: Sub;
_includesMaybeArray(_ref = s.data).call(_ref, 1);
_flatMaybeArray(_ref2 = s.data).call(_ref2);