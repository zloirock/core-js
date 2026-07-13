import _Array$from from "@core-js/pure/actual/array/from";
import _Array$fromAsync from "@core-js/pure/actual/array/from-async";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Array$of from "@core-js/pure/actual/array/of";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// a BODYLESS control-slot host with an SE-bearing init: the SE lift block-wraps the
// statement in place, so the flatten render must re-anchor onto the moved declaration
// (a stale path pointed at the wrapper block and built an invalid declaration - a hard
// build abort on valid input). the effect stays inside the guarded block
const seen = [];
const eff = t => (_pushMaybeArray(seen).call(seen, t), t);
let c = 1;
if (c) {
  eff('a');
  var from = _Array$from;
}

// array-wrapped twin: the wrapper descent and the block-wrap compose
if (c) {
  eff('b');
  var of = _Array$of;
}

// bodyless loop arm
while (c--) {
  eff('c');
  var fromAsync = _Array$fromAsync;
}

// assignment host on a bodyless slot keeps its own channel
let groupBy;
if (seen.length) {
  eff('d');
  groupBy = _Map$groupBy;
}
export { from, of, fromAsync, groupBy, seen };