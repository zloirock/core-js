// the polyfilled optional call sits directly in `new (...)` callee position; the emitted
// optional call must stay grouped so `new` applies to the call's result, not the helper
var X = new (arr.flat?.())(z);
