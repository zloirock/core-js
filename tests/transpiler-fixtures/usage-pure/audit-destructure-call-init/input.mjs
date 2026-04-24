// destructure from a call init with multiple instance-method properties - the init call
// must be evaluated once (single `getArr()`) and shared across each polyfill lookup
const { at, includes } = getArr();
