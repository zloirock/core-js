import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$keys from "@core-js/pure/actual/object/keys";
import _Object$values from "@core-js/pure/actual/object/values";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// a CALL / IIFE-rooted proxy chain consumed by a fully-static destructure (`const {iterator} =
// (f()).self.Symbol`): the receiver value is DISCARDED (the prop synth-swaps to a direct pure import), so what
// survives is the HARVEST alone - a SE-bearing chain-root call runs where the source ran it, a provably pure
// one drops with the navigation, and with nothing harvested the whole residual goes: the read it would spell
// stands on an always-defined binding and observes nothing the extraction does not.
// covers an IIFE root, a bound-arrow root, a SE-arrow root, and a multi-prop pattern (collapse fires once)
let r = 0;
const iterator = _Symbol$iterator;
iterator;
const bf = () => _globalThis;
const from = _Array$from;
from([1]);
const sf = () => (r++, _globalThis);
sf();
const resolve = _Promise$resolve;
resolve(1);
const keys = _Object$keys;
const values = _Object$values;
keys({});
values({});