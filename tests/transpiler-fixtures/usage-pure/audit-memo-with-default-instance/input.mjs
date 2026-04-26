// destructure from a call expression init with one default-valued instance property plus
// another instance property: the call result must be evaluated once and shared, and the
// default fallback must fire only when the polyfill lookup returns undefined.
const { at = alt, includes } = getArr();
