import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
// A `var` hoists its NAME to the function scope, but its initializer still evaluates in the block it is written in: an init name
// shadowed THERE must win, even though the use sits outside that block.
const raceRoot = Promise;