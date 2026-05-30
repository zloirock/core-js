// computed-key outer call on a single-optional inner (`a.flat?.()["includes"](2)`): the inner
// result must keep its receiver, emitted as `_ref.call(a)` not `_ref()`. bailing the computed-key
// outer to the standalone path used to drop the receiver here (a runtime throw); the combine binds it
a.flat?.()["includes"](2);
