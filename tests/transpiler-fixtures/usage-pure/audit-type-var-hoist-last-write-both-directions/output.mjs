import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// the LAST write before the use decides the type, and reading a hoisted var's writes at all needs the
// synthetic binding to carry them the way a native one does. both directions live here, a method
// each: one write restores the array, the other lands on a string
declare const arrSrc: string[];
declare const strSrc: string;
export function viaReassignedBackToArray() {
  {
    var restored = strSrc;
  }
  restored = arrSrc;
  {
    return _atMaybeArray(restored).call(restored, 0);
  }
}
export function viaReassignedAfterBlock() {
  {
    var reassigned = arrSrc;
  }
  reassigned = strSrc;
  {
    return _includesMaybeString(reassigned).call(reassigned, "x");
  }
}