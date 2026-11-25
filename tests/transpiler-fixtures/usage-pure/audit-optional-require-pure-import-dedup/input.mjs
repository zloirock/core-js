// The optional load may be skipped. An independent use of Promise still needs its own constructor.
var Foo = require?.("@core-js/pure/actual/promise/constructor");
export const p = new Promise(resolve => resolve());
module.exports = { p };
