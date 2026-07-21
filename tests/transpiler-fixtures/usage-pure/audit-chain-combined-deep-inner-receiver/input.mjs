// chain-combine whose inner receiver is another polyfilled optional chain (`a.flat?.()` behind a
// second `.flat?.()`): the inner-most call must be polyfilled inside the memoized receiver, not
// emitted raw. leaving the receiver subtree visitable lets its standalone polyfill apply.
// the receiver's own live `?.` short-circuits the WHOLE chain natively, so it is TESTED before
// the outer helper reads it - folding it into the helper argument threw on a missing method
// where native yields undefined
a.flat?.().flat?.().includes(2);
