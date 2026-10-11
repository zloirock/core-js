var _Iterator = require("@core-js/pure/actual/iterator/constructor");
var _Map = require("@core-js/pure/actual/map/constructor");
var _Promise = require("@core-js/pure/actual/promise/constructor");
// the same top level in a file spelling CommonJS is the body of the wrapper its loader puts around it: a `var` or a
// function there is the wrapper's own, so the constructors it holds stay home and keep their narrow entries
var Promise = _Promise;
var M;
M = _Map;
function iteratorCtor() {
  return _Iterator;
}
module.exports = 0;