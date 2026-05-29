// intermediate hop whose method is native at the target (`.reverse()`, not polyfilled here): it
// threads as verbatim source appended to the inner result instead of being wrapped in a polyfill
// binding, while the polyfilled inner and outer still combine around it
const arr = [1, 2];
arr.flat?.().reverse().filter?.(y => y > 4);
