import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// array-WRAPPED alias whose hop is shadowed by a param
const wrapRoot = Array;
const wrapLink = wrapRoot;
export function viaArrayWrapChain(wrapRoot) {
  const [{
    from
  }] = [wrapLink];
  return from([1]);
}