var _atMaybeArray = require("@core-js/pure/actual/array/instance/at");
var _pushMaybeArray = require("@core-js/pure/actual/array/instance/push");
// A prefix runs before the nested read and its surviving sibling. The admitted
// top-level receiver stays this; it is not replaced with the realm object.
exports.Array = Array;
exports.kept = 7;
const effects = [];
{
  var _ref;
  const {} = (_pushMaybeArray(effects).call(effects, 'prefix'), this);
  const at = (_ref = _atMaybeArray(this.Array.prototype)) === void 0 ? (_pushMaybeArray(effects).call(effects, 'default'), null) : _ref;
  const {
    kept
  } = this;
  exports.result = [at.call([1, 2], -1), kept, effects];
}