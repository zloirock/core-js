var $           = require('./_')
  , $export     = require('./_export')
  , DESCRIPTORS = require('./_descriptors')
  , anObject    = require('./_an-object')
  , getKeys     = require('./_object-keys');

var $defineProperties = function defineProperties(O, Properties){
  anObject(O);
  var keys   = getKeys(Properties)
    , length = keys.length
    , i = 0
    , P;
  while(length > i)$.setDesc(O, P = keys[i++], Properties[P]);
  return O;
};

if(!DESCRIPTORS)$.setDescs = $defineProperties;

// 19.1.2.3 / 15.2.3.7 Object.defineProperties(O, Properties)
$export($export.S + $export.F * !DESCRIPTORS, 'Object', {defineProperties: $defineProperties});