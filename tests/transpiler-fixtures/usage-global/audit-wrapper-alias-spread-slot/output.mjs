import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.from-entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// the inject-if-might twin of the pure spread decline: a spread-shifted slot's lone enumerable
// candidate still follows here, because a wrong guess over-injects - the safe direction - so the
// leaf claim through the wrapper alias pulls its module
const xs = [];
const [wrapper] = [...xs, [globalThis]];
export const [{
  Object: {
    fromEntries: viaSpread
  }
}] = wrapper;
export const spreadResolved = viaSpread([["k", 1]]);