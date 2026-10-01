var _at = require("@core-js/pure/actual/instance/at");
var _Object$fromEntries = require("@core-js/pure/actual/object/from-entries");
// in sloppy code a block-level `function Array() {}` hoists onto the function (Annex B) and shadows
// the global there: the type layer resolves the name to that function, so its call returns no known
// array and the read takes the generic dispatch. a write to the hoisted name from a nested function
// is a write to that function's own hoist, not to an outer alias - the alias keeps its static, and
// the two rows carry different globals so neither hides the other
function shadowed(x) {
  var _ref;
  {
    function Array() {}
  }
  return _at(_ref = Array.from(x)).call(_ref, 0);
}
function aliased(list) {
  var O = Object;
  function inner() {
    {
      function O() {}
    }
    O = 1;
  }
  return _Object$fromEntries(list);
}
module.exports = {
  shadowed,
  aliased
};