import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// the two remaining write shapes that carry no assignment node, each with its own visitor key: an
// update, and a second initialized `var` of the same name (a WRITE, not a second binding - the
// declaration the walk owns is the first in tree order). inside the guard the type is proven, so
// both rows narrow and neither string leg may appear
declare const unionSrc: string[] | string;
declare const strItems: string[];
export function viaUpdateWriteThenGuard() {
  {
    var bumped = unionSrc;
  }
  bumped++;
  if (Array.isArray(bumped)) {
    return _atMaybeArray(bumped).call(bumped, 0);
  }
}
export function viaRedeclareThenGuard() {
  {
    var redeclared = unionSrc;
  }
  {
    var redeclared = strItems;
  }
  if (Array.isArray(redeclared)) {
    return _includesMaybeArray(redeclared).call(redeclared, "x");
  }
}