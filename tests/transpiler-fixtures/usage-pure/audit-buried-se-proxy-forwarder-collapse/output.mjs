import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Math$trunc from "@core-js/pure/actual/math/trunc";
import _Number$MAX_SAFE_INTEGER from "@core-js/pure/actual/number/max-safe-integer";
import _Symbol$asyncIterator from "@core-js/pure/actual/symbol/async-iterator";
// a side-effect prefix BURIED one hop below a static / forwarder member (`(eff(), globalThis.self).Array
// .from`) leaves the inner proxy-global leaf inside a separately-walked sequence: the marking descent must
// peel to the sequence tail so the leaf is suppressed, else the unplugin member visitor queues a parallel
// `globalThis.self -> _globalThis` rewrite the outer static collapse cannot compose -> hard crash (babel is
// benign: it re-emits then drops the consumed subtree). an IIFE-ROOTED buried chain (`(0, (() =>
// globalThis)().self).Math`) needs the same: the subsumption walk must peel the buried sequence to reach
// the IIFE root and mark it (a pure IIFE drops; an effectful prefix/IIFE is preserved and re-emitted).
// covers static-call / static-property / symbol-key (direct + DEEP-hop SE under a proxy hop) /
// IIFE-rooted-forwarder / IIFE-tail-with-effect-prefix. the deep-hop symbol-key effect sits BELOW the
// `.self` hop, so it must be harvested by the full chain descent, not a single-level sequence peel
let eff = () => 0;
const obj = {};
export const a = (eff(), _Array$from)([1, 2]);
export const b = (eff(), _Number$MAX_SAFE_INTEGER);
export const c = (eff(), _getIteratorMethod(obj));
export const d = _Math$trunc(1.5);
export const e = (eff(), _Array$of)(1, 2);
export const f = obj[eff(), _Symbol$asyncIterator];