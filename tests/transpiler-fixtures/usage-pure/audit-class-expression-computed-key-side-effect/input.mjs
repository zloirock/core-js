// Class expression with a computed key `[fn()]` is side-effecting; the call must run at class-eval time.
// Destructure flatten must lift the SE-bearing prefix as a standalone statement and emit the polyfill.
var { from } = (class { [fn()]() {} }, Array);
from([1]);
