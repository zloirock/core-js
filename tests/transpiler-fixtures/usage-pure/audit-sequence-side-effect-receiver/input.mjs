// mirror of `audit-sequence-side-effect-key` on the receiver side: `(fn(), Array).from(src)`.
// a sequence with a side-effectful head on the receiver must still resolve `Array.from`;
// the emitted call wraps the polyfill id in a source-level sequence so `fn()` is preserved
(fn(), Array).from(src);
