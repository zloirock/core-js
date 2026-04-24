// destructure from a call init with one default-valued instance property plus another
// instance property: the call must be evaluated once (memoized), and the default must
// fire only when the polyfill lookup returns undefined
const { at = alt, includes } = getArr();
