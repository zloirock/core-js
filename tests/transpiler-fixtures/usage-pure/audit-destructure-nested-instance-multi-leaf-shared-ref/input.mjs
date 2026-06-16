// TWO instance methods (`at`, `flat`) destructured off the SAME nested constant-literal receiver. each leaf
// is body-extracted, but the receiver is memoized into a SINGLE shared `_ref` (keyed by the receiver node)
// rather than re-emitted once per leaf - so the literal appears once, not three times. the declaration binds
// two names, so the residual is kept (elimination needs a sole binding); both sentinels survive in it
const { b: { at, flat } } = { b: [1, [2], 3] };
at(0);
flat();
