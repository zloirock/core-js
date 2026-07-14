import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// the type can also arrive through a CALL on the hoisted binding (its return annotation) or through a
// closure that reads it - two distinct descents, a method each
declare const objSrc: {
  v: string[];
};
declare function mkArr(): string[];
export function viaCallReturn() {
  {
    var make = mkArr;
  }
  {
    var _ref;
    return _atMaybeArray(_ref = make()).call(_ref, 0);
  }
}
export function viaClosureField() {
  {
    var owner = objSrc;
  }
  {
    var _ref2;
    return _includesMaybeArray(_ref2 = (() => owner.v)()).call(_ref2, "x");
  }
}