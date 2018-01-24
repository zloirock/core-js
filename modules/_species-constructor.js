// 7.3.20 SpeciesConstructor(O, defaultConstructor)
var anObject = require('core-js-internals/an-object');
var aFunction = require('core-js-internals/a-function');
var SPECIES = require('./_wks')('species');
module.exports = function (O, D) {
  var C = anObject(O).constructor;
  var S;
  return C === undefined || (S = anObject(C)[SPECIES]) == undefined ? D : aFunction(S);
};
