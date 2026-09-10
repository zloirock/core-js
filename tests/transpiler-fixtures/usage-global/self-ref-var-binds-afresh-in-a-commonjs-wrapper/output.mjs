require("core-js/modules/es.object.to-string");
require("core-js/modules/es.promise.constructor");
require("core-js/modules/es.promise.catch");
require("core-js/modules/es.promise.finally");
require("core-js/modules/es.promise.try");
// a CommonJS wrapper's top level IS a function body, and it is the only SLOPPY host a pass of ours
// emits for - the consumer that resolves the injection we write is the one that wraps the file - so a
// `var` there binds afresh exactly as one inside any other function does and the self-reference reads
// the hoisted `undefined`. the control is the same file's ordinary static read, which still injects
var Iterator = Iterator;
module.exports = Iterator;
exports.control = Promise.try(() => 1);