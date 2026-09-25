import _DisposableStack from "@core-js/pure/actual/disposable-stack";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
import _Set from "@core-js/pure/actual/set";
import _WeakMap from "@core-js/pure/actual/weak-map";
import _WeakSet from "@core-js/pure/actual/weak-set";
// a computed hop key spelled by a CALL runs exactly once where the source runs it when the hop
// collapses onto its polyfill - on a read, a destructure, an optional member, and a WRITE through the
// hop (plain, logical, delete, update), which lands on the constructor the read would see
function k(v) {
  log();
  return v;
}
use((k('Map'), _Map$groupBy));
k('Promise'), _Promise;
const t = _Promise$try;
use(t, (k('Iterator'), _Iterator$from));
(k('Set'), _Set).extra = 1;
(k('WeakMap'), _WeakMap).extra ??= 1;
delete (k('WeakSet'), _WeakSet).extra;
(k('DisposableStack'), _DisposableStack).count++;