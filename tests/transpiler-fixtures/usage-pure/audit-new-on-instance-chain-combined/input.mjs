// when an instance-method chain is constructed with `new`, the polyfill
// must keep the `new` keyword instead of collapsing to a regular call,
// otherwise the user's constructor invocation silently turns into a call.
var X = new (arr.flat?.().at)(1, 2);
