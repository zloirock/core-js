import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// Proxy-global member used as destructure receiver: the inner `globalThis` Identifier
// must be skipped by both pipelines after synth-swap rewrites the outer chain to a
// literal. Multiple receivers in the same file lock the markSynthReceiverSkipped
// helper across both branches.
const from = _Array$from;
const of = _Array$of;
const a = from('a');
const b = of(1, 2);
_findLastMaybeArray(a).call(a, x => x);
_flatMaybeArray(b).call(b);