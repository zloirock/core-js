var path = require('../internals/path');
var wksExt = require('../internals/wks-ext');
var defineProperty = require('../internals/object-define-property').f;

module.exports = function (name) {
  var Symbol = path.Symbol || (path.Symbol = {});
  if (name.charAt(0) != '_' && !(name in Symbol)) defineProperty(Symbol, name, { value: wksExt.f(name) });
};
