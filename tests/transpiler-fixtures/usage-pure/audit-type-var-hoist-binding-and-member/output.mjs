import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// the plainest two channels a hoisted `var` answers through: its own declared type, and a member read
// off it. one method each, so the import set attributes per row - both narrow, so neither string leg
// may appear
declare const arrSrc: string[];
declare const objSrc: {
  a: string[];
  v: string[];
};
export function viaBindingType() {
  {
    var held = arrSrc;
  }
  {
    return _atMaybeArray(held).call(held, 0);
  }
}
export function viaMemberField() {
  {
    var obj = objSrc;
  }
  {
    var _ref;
    return _includesMaybeArray(_ref = obj.a).call(_ref, "x");
  }
}