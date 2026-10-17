import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.from-entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// a const-bound array wrapper reached through a PATTERN slot still descends to its real value
const [wrapper] = [[globalThis]];
export const [{
  Object: {
    fromEntries: viaWrapper
  }
}] = wrapper;
export const wrapperResolved = viaWrapper([['d', 4]]);