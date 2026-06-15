import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _Set from "@core-js/pure/actual/set/constructor";
const from = _Array$from;
// A proxy-global member chain with a redundant `.self` hop inside a LOGICAL-expression destructure
// receiver must collapse the hop in the live operand, the same as a bare receiver: `globalThis.self`
// is undefined on ie:11 / non-browser hosts, so the left operand throws BEFORE the `||` can
// short-circuit. Both emitters collapse to `_globalThis.Array || _Set`.
const {
  from: _unused,
  ...rest
} = _globalThis.Array || _Set;
from([1]);