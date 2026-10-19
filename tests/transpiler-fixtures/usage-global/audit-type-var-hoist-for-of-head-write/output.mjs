import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// a for-of head writes a hoisted `var` without an assignment node, so the write map has to reach it
// through its own visitor key. inside a guard the type IS proven, so the read narrows to the array leg
// alone - a write the map missed could not be vouched for, and the binding would widen, adding the
// string leg
declare const unionSrc: string[] | string;
declare const strItems: string[];
export function viaForOfWriteThenGuard() {
  {
    var rebound = unionSrc;
  }
  for (rebound of strItems) {}
  if (Array.isArray(rebound)) {
    return rebound.at(0);
  }
}