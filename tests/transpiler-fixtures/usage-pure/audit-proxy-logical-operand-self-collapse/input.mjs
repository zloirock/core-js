// A proxy-global member chain with a redundant `.self` hop inside a LOGICAL-expression destructure
// receiver must collapse the hop in the live operand, the same as a bare receiver: `globalThis.self`
// is undefined on ie:11 / non-browser hosts, so the left operand throws BEFORE the `||` can
// short-circuit. Both emitters collapse to `_globalThis.Array || _Set`.
const { from, ...rest } = globalThis.self.Array || Set;
from([1]);
