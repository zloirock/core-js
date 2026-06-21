// a conditional-receiver destructure whose key IS polyfillable on both branches (Array.from /
// Iterator.from), but also binds a computed key off a bare global ([Set]) that can't fold into
// a per-branch synth literal (would emit `Set` raw and throw). the whole pattern bails, leaving
// `from` untouched; both emitters warn once for `from`, the `[Set]` key is gated out (no warning).
const cond = true;
const { from, [Set]: ctor } = cond ? Array : Iterator;
from([1, 2, 3]);
ctor;
