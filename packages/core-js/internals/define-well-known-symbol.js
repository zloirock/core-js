var path = require('../internals/path');
var has = require('../internals/has');
var wrappedWellKnownSymbolModule = require('../internals/well-known-symbol-wrapped');
var definePropertyModule = require('../internals/object-define-property');

module.exports = function (NAME) {
  var Symbol = path.Symbol || (path.Symbol = {});
  if (!has(Symbol, NAME)) definePropertyModule.f(Symbol, NAME, {
    value: wrappedWellKnownSymbolModule.f(NAME),
  });
};
