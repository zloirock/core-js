import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.string.includes";
import "core-js/modules/es.string.iterator";
import "core-js/modules/esnext.iterator.includes";
import "core-js/modules/web.dom-collections.iterator";
// a for-of head writes a hoisted `var` without an assignment node, so the write map has to reach it
// through its own visitor key. both sides of that channel live here, one method each, so the import
// set attributes per row: `at` narrows to the array leg alone, `includes` must keep BOTH legs
declare const unionSrc: string[] | string;
declare const strItems: string[];
declare const arrSrc: string[];

// inside the guard the type IS proven, so this row narrows - a write the map missed cannot be
// vouched for, and the binding would widen, adding the string leg
export function viaForOfWriteThenGuard() {
  {
    var rebound = unionSrc;
  }
  for (rebound of strItems) {}
  if (Array.isArray(rebound)) {
    return rebound.at(0);
  }
}

// the same head with NO guard: the loop back-edge makes the positional "last write" untrustworthy,
// so widening is the CORRECT answer and both legs must stay - a spurious narrow would drop one
export function viaForOfHeadWriteStaysGeneric() {
  {
    var looped = arrSrc;
  }
  for (looped of strItems) {}
  {
    return looped.includes("x");
  }
}