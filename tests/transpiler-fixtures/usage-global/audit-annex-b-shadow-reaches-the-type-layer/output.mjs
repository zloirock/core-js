require("core-js/modules/es.object.from-entries");
require("core-js/modules/es.object.to-string");
require("core-js/modules/es.array.iterator");
require("core-js/modules/es.array.at");
require("core-js/modules/es.string.at");
// in sloppy code a block-level `function Array() {}` hoists onto the function (Annex B) and shadows
// the global there: the type layer resolves the name to that function, so its call returns no known
// array and the read takes the generic dispatch. a write to the hoisted name from a nested function
// is a write to that function's own hoist, not to an outer alias - the alias keeps its static, and
// the two rows carry different globals so neither hides the other
function shadowed(x) {
  {
    function Array() {}
  }
  return Array.from(x).at(0);
}
function aliased(list) {
  var O = Object;
  function inner() {
    {
      function O() {}
    }
    O = 1;
  }
  return O.fromEntries(list);
}
module.exports = {
  shadowed,
  aliased
};