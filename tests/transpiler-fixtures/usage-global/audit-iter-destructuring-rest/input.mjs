// iterable destructure with rest `[a, ...rest] = iter`: the iteration protocol must
// be polyfilled because the rest pattern consumes the iterator.
const [a, ...rest] = arr;
