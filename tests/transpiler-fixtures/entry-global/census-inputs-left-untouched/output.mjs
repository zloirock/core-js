import "core-js/modules/es.suppressed-error.constructor";
import "core-js/modules/es.promise.try";
import "core-js/modules/es.async-disposable-stack.constructor";
import "core-js/modules/es.async-iterator.async-dispose";
import "core-js/modules/es.disposable-stack.constructor";
import "core-js/modules/es.iterator.concat";
import "core-js/modules/es.iterator.dispose";
import "core-js/modules/es.iterator.drop";
import "core-js/modules/es.iterator.take";
import "core-js/modules/es.iterator.zip";
import "core-js/modules/es.iterator.zip-keyed";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.math.sum-precise";
import "core-js/modules/es.regexp.escape";
import "core-js/modules/es.uint8-array.from-base64";
import "core-js/modules/es.uint8-array.from-hex";
import "core-js/modules/es.uint8-array.set-from-base64";
import "core-js/modules/es.uint8-array.set-from-hex";
import "core-js/modules/es.uint8-array.to-base64";
import "core-js/modules/es.uint8-array.to-hex";
import "core-js/modules/es.weak-map.get-or-insert";
import "core-js/modules/es.weak-map.get-or-insert-computed";
import "core-js/modules/esnext.iterator.chunks";
import "core-js/modules/esnext.iterator.includes";
import "core-js/modules/esnext.iterator.join";
import "core-js/modules/esnext.iterator.windows";
import "core-js/modules/esnext.promise.all-keyed";
import "core-js/modules/esnext.promise.all-settled-keyed";
import "core-js/modules/web.dom-exception.stack";
import "core-js/modules/web.clear-immediate";
import "core-js/modules/web.set-immediate";
import "core-js/modules/web.structured-clone";
// Every shape the per-file census exists for, in the one mode that reads almost none of it:
// entry-global replaces the entry import and mints no name of its own, so the destructures stay,
// the monkey-patched static stays, and the user's temp-shaped slot names are never reserved
// against anything. The minifier-shape split is the ONE census answer this mode does consume,
// so the collapsed sequence below must still come out split.

var _ref = 1;
globalThis['_ref2'] = 2;
Array.from = function () {
  return [];
};
const {
  from
} = Array;
const {
  Map: M
} = globalThis;
sideEffect();
({
  keys
} = Object);
from;
function sideEffect() {}
export { from, M, keys, _ref };
var keys;