var _atMaybeArray = require("@core-js/pure/actual/array/instance/at");
// a SLOPPY host's top level is a CommonJS wrapper's function body, not the realm's own scope, so
// `escapes` is a name no other file can call: the in-file call census is whole, the default's type
// describes the parameter, and the read narrows to the array-specific dispatcher exactly as it does
// inside a function. `kept` is nested in a function, out of reach in every host, and carries the same
// narrow - the two rows agreeing is what pins the top level to the wrapper. the injection beside them
// spells `require`, which is the wrapper's own loader
function escapes(x = [1, 2, 3]) {
  return _atMaybeArray(x).call(x, 0);
}
function host() {
  function kept(y = [1, 2, 3]) {
    return _atMaybeArray(y).call(y, 0);
  }
  return kept();
}
var out = [escapes(), host()];