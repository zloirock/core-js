import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.string.includes";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// a for-of head writes a hoisted `var` without an assignment node, so the write map has to reach it
// through its own visitor key. with NO guard after the loop, its back-edge makes the positional "last
// write" untrustworthy, so widening is the CORRECT answer and both legs must stay - a spurious narrow
// would drop one
declare const strItems: string[];
declare const arrSrc: string[];
export function viaForOfHeadWriteStaysGeneric() {
  {
    var looped = arrSrc;
  }
  // @ts-expect-error a loop head write tsc refuses is the shape under test
  for (looped of strItems) {}
  {
    return looped.includes("x");
  }
}