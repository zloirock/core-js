// `(fn(), Array).from(src)` - comma-expression on the receiver side carrying a
// side-effectful head. resolution must still see `Array.from`; the emitted call wraps the
// polyfill id in a source-level sequence so `fn()` is preserved at the original point
(fn(), Array).from(src);
