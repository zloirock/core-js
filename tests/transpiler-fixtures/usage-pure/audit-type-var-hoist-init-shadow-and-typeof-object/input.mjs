// a hoisted `var` hoists its NAME, but its initializer still evaluates in the block it is WRITTEN in,
// so a shadow of an init name there wins and the type follows the shadow - to a string, which makes
// the `at` row's lock the STRING leg alone. The second row retains its declared Array/Number
// union across the typeof guard; only Array needs an includes polyfill.
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
