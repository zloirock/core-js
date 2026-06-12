import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$keys from "@core-js/pure/actual/object/keys";
// a fully-consumed destructure whose SE-wrapped init ends in an effect-free PROXY-MEMBER
// tail lifts ONLY the prefix: the tail is dead after consumption, and keeping it emitted a
// spurious proxy-global read + import (import-set parity). a bare-constructor tail stays in
// the lifted statement, and a for-init host keeps the whole init under a sink declarator
eff();
const from = _Array$from;
from([1]);
eff2();
const of = _Array$of;
of(2);
const keys = _Object$keys;
const { isArray } = (eff3(), _globalThis.Object);
isArray(keys);