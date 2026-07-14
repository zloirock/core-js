import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// a for-in head writes a hoisted `var` without an assignment node, through a visitor key of its own -
// it regresses independently of for-of. both sides of the channel, a method each
declare const unionSrc: string[] | string;
declare const arrSrc: string[];
declare const keyedSrc: Record<string, string>;
export function viaForInWriteThenGuard() {
  {
    var keyBound = unionSrc;
  }
  for (keyBound in keyedSrc) {}
  if (Array.isArray(keyBound)) {
    return _atMaybeArray(keyBound).call(keyBound, 0);
  }
}

// no guard: the head rewrites the binding per iteration and the back-edge makes the positional
// "last write" untrustworthy, so widening is correct and both legs must stay
export function viaForInHeadWriteStaysGeneric() {
  {
    var keyHeld = arrSrc;
  }
  for (keyHeld in keyedSrc) {}
  {
    return _includes(keyHeld).call(keyHeld, "x");
  }
}