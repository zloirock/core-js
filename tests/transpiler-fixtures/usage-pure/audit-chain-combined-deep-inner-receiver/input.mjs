// chain-combine whose inner receiver is another polyfilled optional call (`a.flat?.()` behind a
// second `.flat?.()`): that call is the receiver's live link, so its lookup - the polyfilled method,
// never a raw read - is the guard's first test, and the call's result is read plainly by the outer
// lookup: a missing inner method short-circuits the WHOLE chain, a nullish result throws at the
// outer read, as native does
a.flat?.().flat?.().includes(2);
