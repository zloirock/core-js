var uncurryThis = require('../internals/function-uncurry-this');

var toString = uncurryThis({}.toString);
var slice = uncurryThis(''.slice);

module.exports = function (it) {
  return slice(toString(it), 8, -1);
};
