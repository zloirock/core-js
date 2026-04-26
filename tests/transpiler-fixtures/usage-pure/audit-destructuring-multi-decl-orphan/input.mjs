// multi-declarator destructure where one declarator is orphaned (unused): the orphan
// must not trigger a stray polyfill emission.
const { from } = Array, x = Promise;
