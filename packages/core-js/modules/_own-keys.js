var getOwnPropertyNamesModule = require('./_object-get-own-property-names');
var getOwnPropertySymbolsModule = require('./_object-get-own-property-symbols');
var anObject = require('core-js-internals/an-object');
var Reflect = require('core-js-internals/global').Reflect;

// all object keys, includes non-enumerable and symbols
module.exports = Reflect && Reflect.ownKeys || function ownKeys(it) {
  var keys = getOwnPropertyNamesModule.f(anObject(it));
  var getOwnPropertySymbols = getOwnPropertySymbolsModule.f;
  return getOwnPropertySymbols ? keys.concat(getOwnPropertySymbols(it)) : keys;
};
