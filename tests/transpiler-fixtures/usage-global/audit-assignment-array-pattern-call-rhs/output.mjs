import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// destructuring assignment with a call expression on the RHS: the existing binding `x`
// is reused for the rewrite; subsequent `x.at(0)` instance call still polyfills.
let x;
[x] = getArray();
x.at(0);