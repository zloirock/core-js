import "core-js/modules/es.array.includes";
import "core-js/modules/es.string.at";
// a hoisted `var` hoists its NAME, but its initializer still evaluates in the block it is WRITTEN in,
// so a shadow of an init name there wins and the type follows the shadow - to a string, which makes
// the `at` row's lock the STRING leg alone. the second row is the under-resolving negative: the
// resolver does not narrow on `typeof x === "object"`, so pure keeps the GENERIC helper, while
// global still injects the array module - the number arm carries no such method to inject one for
declare const arrSrc: string[];
declare const mixedSrc: string[] | number;
export function viaInitShadowedToString() {
  {
    const arrSrc = "xy";
    var held = arrSrc;
  }
  {
    return held.at(0);
  }
}
export function viaTypeofGuardStaysGeneric() {
  {
    var mixed = mixedSrc;
  }
  {
    if (typeof mixed === "object") return mixed.includes("x");
  }
}