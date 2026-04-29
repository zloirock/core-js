import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// `Symbol[(fn(), 'iterator')]` - comma-expression computed key with a side-effecting
// preceding element. side-effect extraction pulls `fn()` out as a sideEffects entry on
// the member-meta; emission wraps the polyfill id in a source-level sequence so fn()
// still runs before `_Symbol$iterator` is read, preserving the original evaluation
// order of the prefix
(fn(), _Symbol$iterator);