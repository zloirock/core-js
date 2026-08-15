import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _padStartMaybeString from "@core-js/pure/actual/string/instance/pad-start";
// a namespace-local declaration SHADOWS an outer namesake, and the reverse case has to keep
// working in the same file: a value declared OUTSIDE keeps the outer declaration even when it is
// read from inside the namespace. both answers come from anchoring the name lookup at the
// declaration the annotation was written on, not at the site the value is used from
interface Inner {
  items: string;
}
declare const outside: Inner;
namespace NS {
  var _ref2, _ref3;
  interface Inner {
    items: number[];
  }
  declare function make(): Inner;
  export function readParam(v: Inner) {
    var _ref;
    return _atMaybeArray(_ref = v.items).call(_ref, 0);
  }
  export const fromAmbient = _includesMaybeArray(_ref2 = make().items).call(_ref2, 1);
  export const fromOutside = _padStartMaybeString(_ref3 = outside.items).call(_ref3, 2);
}
export const r = [NS.readParam({
  items: [1]
}), NS.fromAmbient, NS.fromOutside];