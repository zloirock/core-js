var _atMaybeArray = require("@core-js/pure/actual/array/instance/at");
// A stored receiver belongs to the CommonJS activation, not to the realm object.
var src;
module.exports = {
  first: _atMaybeArray(src = [1, 2]).call(src, 0),
  src
};