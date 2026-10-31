require("core-js/modules/es.array.at");
require("core-js/modules/es.array.push");
// A prefix runs before the nested read and its surviving sibling. The admitted
// top-level receiver stays this; it is not replaced with the realm object.
exports.Array = Array;
exports.kept = 7;
const effects = [];
{
  const {
    Array: {
      prototype: {
        at = (effects.push('default'), null)
      }
    },
    kept
  } = (effects.push('prefix'), this);
  exports.result = [at.call([1, 2], -1), kept, effects];
}