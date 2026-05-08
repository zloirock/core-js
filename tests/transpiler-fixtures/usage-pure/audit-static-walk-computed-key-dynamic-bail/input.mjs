// computed key with a non-statically-resolvable expression `[fn()]: Array`: the runtime
// key is unknowable, so the destructure must stay unflattened and `from` not be wired
// to the static. companion to audit-static-walk-computed-key-skip (key DOES fold there)
declare const fn: () => string;
const wrapper = { [fn()]: Array };
const { a: { from } } = wrapper;
from;
[1].at(0);
