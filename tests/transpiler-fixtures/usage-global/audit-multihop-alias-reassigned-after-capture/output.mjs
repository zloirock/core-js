import "core-js/modules/es.object.from-entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// a multi-hop const-alias captures a constructor wrapper; an intermediate hop reassigned AFTER its
// capture cannot change the already-captured value, so the static still resolves and usage-global injects
// its polyfill. the dominance proof must anchor at each hop's READ site (the prior declarator), not the
// host use - else the later write spuriously dominates and the import is dropped. distinct statics per chain.
var inner = {
  K: Array
};
const s1 = inner;
const s = s1;
inner = 0;
const {
  K: {
    from
  }
} = s;
from([1]);
var inner2 = {
  K: Object
};
const t = inner2;
inner2 = 0;
const {
  K: {
    fromEntries
  }
} = t;
fromEntries([['k', 1]]);