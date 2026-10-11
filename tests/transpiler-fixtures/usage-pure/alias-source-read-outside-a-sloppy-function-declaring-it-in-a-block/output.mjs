var _Array$from = require("@core-js/pure/actual/array/from");
var _Promise = require("@core-js/pure/actual/promise/constructor");
var _Promise$resolve = require("@core-js/pure/actual/promise/resolve");
// an alias reads its source where it is declared, so a block-level function of the same name in a sloppy
// function the use stands in - hoisted to that function, not to the alias - does not shadow that read:
// the alias still holds the global
var B = Array;
function direct() {
  {
    function Array() {}
  }
  return _Array$from(xs);
}
var P = _Promise;
function closure() {
  {
    function Promise() {}
  }
  return function () {
    return _Promise$resolve(1);
  };
}
use(direct, closure);