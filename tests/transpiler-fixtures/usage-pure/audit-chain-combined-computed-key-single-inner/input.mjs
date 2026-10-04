// computed-key outer call on a single-optional inner (`a.flat?.()["includes"](2)`): the inner
// call must keep its original receiver. Bailing the computed-key
// outer to the standalone path used to drop the receiver here (a runtime throw); the combine binds it
a.flat?.()["includes"](2);
