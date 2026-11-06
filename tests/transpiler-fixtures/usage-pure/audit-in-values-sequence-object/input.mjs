// `'values' in (0, Object)` - sequence expression wrapping the global `Object`.
// plugin peels the sequence, recognizes the receiver, and folds the whole `in`
// check to `true` at compile time (polyfill present)
if ('values' in (0, Object)) {}
