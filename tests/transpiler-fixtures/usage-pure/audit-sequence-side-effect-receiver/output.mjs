import _Array$from from "@core-js/pure/actual/array/from";
// mirror of `audit-sequence-side-effect-key` on the receiver side: `(fn(), Array).from(src)`.
// previously `resolveObjectName` bailed because `unwrapParens` wouldn't collapse a sequence
// with a side-effectful head; now `extractSequenceEffects` pulls fn() out, Array.from
// resolves, and emission wraps the polyfill id in a source-level sequence to preserve fn()
(fn(), _Array$from)(src);