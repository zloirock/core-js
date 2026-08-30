import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.from-entries";
import "core-js/modules/es.object.group-by";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// the inject-if-might twin of the wrapped-spelling follow: each wrapped spelling of the wrapper
// alias still pulls its leaf's module (per-line methods are load-bearing - injection is the only
// observable). the spread boundary lives in the spread-slot fixture: there the maybe-union still
// injects, so no negative row is expressible here
const [parenElement] = [[globalThis]];
export const [{
  Object: {
    fromEntries: viaParenElement
  }
}] = parenElement;
const [parenInit] = [[globalThis]];
export const [{
  Object: {
    groupBy: viaParenInit
  }
}] = parenInit;
let seq = 0;
const [seqInit] = (seq++, [[globalThis]]);
export const [{
  Array: {
    from: viaSeqInit
  }
}] = seqInit;
export const results = [viaParenElement([["k", 1]]), viaParenInit([2], x => x), viaSeqInit([3])];