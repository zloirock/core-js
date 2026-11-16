var _atMaybeArray = require("@core-js/pure/actual/array/instance/at");
var _pushMaybeArray = require("@core-js/pure/actual/array/instance/push");
// A later key effect cannot replace an unescaped variable in the CommonJS wrapper.
var list;
list = [3, 4];
var log = [];
module.exports = {
  last: (list, _pushMaybeArray(log).call(log, "key"), _atMaybeArray(list).call(list, -1)),
  log
};