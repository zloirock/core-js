require("core-js/modules/es.array.at");
// A stored receiver belongs to the CommonJS activation, not to the realm object.
var src;
module.exports = {
  first: (src = [1, 2]).at(0),
  src
};