// chain-combine whose inner receiver is another polyfilled optional chain (`a.flat?.()` behind a
// second `.flat?.()`): the inner-most call must be polyfilled inside the memoized receiver, not
// emitted raw. leaving the receiver subtree visitable lets its standalone polyfill apply
a.flat?.().flat?.().includes(2);
