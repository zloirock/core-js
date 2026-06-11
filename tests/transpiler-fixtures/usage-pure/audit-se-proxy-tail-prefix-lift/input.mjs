// a fully-consumed destructure whose SE-wrapped init ends in an effect-free PROXY-MEMBER
// tail lifts ONLY the prefix: the tail is dead after consumption, and keeping it emitted a
// spurious proxy-global read + import (import-set parity). a bare-constructor tail stays in
// the lifted statement, and a for-init host keeps the whole init under a sink declarator
const { from } = (eff(), globalThis.Array);
from([1]);
const { of } = (eff2(), Array);
of(2);
const { isArray, keys } = (eff3(), globalThis.Object);
isArray(keys);
