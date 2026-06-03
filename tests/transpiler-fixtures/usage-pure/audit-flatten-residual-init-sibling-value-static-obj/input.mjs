// static-object receiver nested flatten: the receiver `wrapper` stays verbatim in the
// rebuilt init (no proxy-global root to substitute), so the residual init tail AND the
// residual `x` default `[2].flat()` are both kept verbatim. the flatten extracts
// `from = _Array$from` and the residual instance call must still be polyfilled in place
const wrapper = { ns: Array };
const { ns: { from }, x = [2].flat() } = wrapper;
from([3]);
x;
