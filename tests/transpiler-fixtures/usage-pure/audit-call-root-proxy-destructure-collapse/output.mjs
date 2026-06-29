import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$keys from "@core-js/pure/actual/object/keys";
import _Object$values from "@core-js/pure/actual/object/values";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
import _self from "@core-js/pure/actual/self";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// a CALL / IIFE-rooted proxy chain consumed by a fully-static destructure (`const {iterator} =
// (f()).self.Symbol`): the receiver value is DISCARDED (the prop synth-swaps to a direct pure import), so the
// receiver survives only as a residual whose `.self` hop reads undefined off-engine. collapse it enter-time by
// whole-swapping the pure-ctor leaf (`Symbol -> _Symbol`) like babel and harvesting the chain-root call ahead of
// it. a PURE chain-root call drops (`_Symbol`); a SE-bearing one is kept (`(r++, _Promise)`) so the call runs.
// covers an IIFE root, a bound-arrow root, a SE-arrow root, and a multi-prop pattern (collapse fires once)
let r = 0;
_Symbol;
const iterator = _Symbol$iterator;
iterator;
const bf = () => _globalThis;
_self.Array;
const from = _Array$from;
from([1]);
const sf = () => (r++, _globalThis);
sf(), _Promise;
const resolve = _Promise$resolve;
resolve(1);
_self.Object;
const keys = _Object$keys;
const values = _Object$values;
keys({});
values({});