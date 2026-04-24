// `Array.prototype.at.call(arr, 0)` - the outer `.call` does not look like
// a `.prototype`-rooted access (outer's object is `Array.prototype.at`, not
// `Array.prototype`), so only the inner `.at` is recognised and routed to
// the array-specific polyfill via `Array.prototype`
Array.prototype.at.call(arr, 0);
