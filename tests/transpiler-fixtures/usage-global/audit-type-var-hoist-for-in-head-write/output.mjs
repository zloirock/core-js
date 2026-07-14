import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.string.includes";
import "core-js/modules/esnext.iterator.includes";
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
    return keyBound.at(0);
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
    return keyHeld.includes("x");
  }
}