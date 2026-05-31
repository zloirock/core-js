// chain-combined `recv.flat?.().includes(1)` where the inner receiver is a CALL result (not a
// bare identifier). the `?.` guards the inner CALL, not the `.flat` access, so a nullish receiver
// must THROW on the `.flat` read like native - the emit must NOT prepend a `null == receiver`
// test that would swallow the throw into void 0. the receiver evaluates exactly once: its
// assignment folds into the method-get (`_flat(_ref = getArr())`) rather than a separate slot.
function getArr() { return [1, 2]; }
getArr().flat?.().includes(1);
