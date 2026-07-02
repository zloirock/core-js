// `recv.m?.()` on a non-polyfilled method: the optional call guards the method, but the call
// must still run with `this === recv`. memoizing the callee and invoking `_ref()` would lose
// the receiver - emit `_ref.call(recv)` so the user method keeps its `this`
obj.getArr?.().at(0);
