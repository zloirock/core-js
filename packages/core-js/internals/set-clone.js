var SetHelpers = require('../internals/set-helpers');

var Set = SetHelpers.Set;
var add = SetHelpers.add;
var iterate = SetHelpers.iterate;

module.exports = function (set) {
  var result = new Set();
  iterate(set, function (it) {
    add(result, it);
  });
  return result;
};
