var DESCRIPTORS = require('core-js-internals/descriptors');
var definePropertyModule = require('./_object-define-property');
var anObject = require('core-js-internals/an-object');
var objectKeys = require('./_object-keys');

module.exports = DESCRIPTORS ? Object.defineProperties : function defineProperties(O, Properties) {
  anObject(O);
  var keys = objectKeys(Properties);
  var length = keys.length;
  var i = 0;
  var key;
  while (length > i) definePropertyModule.f(O, key = keys[i++], Properties[key]);
  return O;
};
