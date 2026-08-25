var _Array$from = require("@core-js/pure/actual/array/from");
// a user's own pure import is the canonical dedup target - but only while the file does not WRITE
// through that binding. a reassigned one holds the user's value at the use site, so deduping onto
// it hands every later read that value instead of the polyfill
var myFrom = require("@core-js/pure/actual/array/from");
myFrom = function () {
  return "user";
};
export const written = _Array$from([1]);

// control: the same import, never written - it stays the dedup target and no second import appears
var myOf = require("@core-js/pure/actual/array/of");
export const kept = myOf(1, 2);