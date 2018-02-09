var global = require('core-js-internals/global');
var path = require('./_path');
var IS_PURE = require('./_is-pure');
var wksExt = require('./_wks-ext');
var defineProperty = require('./_object-define-property').f;

module.exports = function (name) {
  var $Symbol = path.Symbol || (path.Symbol = IS_PURE ? {} : global.Symbol || {});
  if (name.charAt(0) != '_' && !(name in $Symbol)) defineProperty($Symbol, name, { value: wksExt.f(name) });
};
