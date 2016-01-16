'use strict';
var $                 = require('./_')
  , $export           = require('./_export')
  , DESCRIPTORS       = require('./_descriptors')
  , createDesc        = require('./_property-desc')
  , cel               = require('./_dom-create')
  , has               = require('./_has')
  , fails             = require('./_fails')
  , anObject          = require('./_an-object')
  , isObject          = require('./_is-object')
  , toIObject         = require('./_to-iobject')
  , arrayIndexOf      = require('./_array-includes')(false)
  , IE_PROTO          = require('./_shared-key')('IE_PROTO')
  , defineProperty    = $.setDesc
  , getOwnDescriptor  = $.getDesc
  , defineProperties  = $.setDescs
  , IE8_DOM_DEFINE;

if(!DESCRIPTORS){
  IE8_DOM_DEFINE = !fails(function(){
    return defineProperty(cel('div'), 'a', {get: function(){ return 7; }}).a != 7;
  });
  $.setDesc = function(O, P, Attributes){
    if(IE8_DOM_DEFINE)try {
      return defineProperty(O, P, Attributes);
    } catch(e){ /* empty */ }
    if('get' in Attributes || 'set' in Attributes)throw TypeError('Accessors not supported!');
    if('value' in Attributes)anObject(O)[P] = Attributes.value;
    return O;
  };
  $.getDesc = function(O, P){
    if(IE8_DOM_DEFINE)try {
      return getOwnDescriptor(O, P);
    } catch(e){ /* empty */ }
    if(has(O, P))return createDesc(!Object.prototype.propertyIsEnumerable.call(O, P), O[P]);
  };
  $.setDescs = defineProperties = function(O, Properties){
    anObject(O);
    var keys   = $.getKeys(Properties)
      , length = keys.length
      , i = 0
      , P;
    while(length > i)$.setDesc(O, P = keys[i++], Properties[P]);
    return O;
  };
}
$export($export.S + $export.F * !DESCRIPTORS, 'Object', {
  // 19.1.2.6 / 15.2.3.3 Object.getOwnPropertyDescriptor(O, P)
  getOwnPropertyDescriptor: $.getDesc,
  // 19.1.2.4 / 15.2.3.6 Object.defineProperty(O, P, Attributes)
  defineProperty: $.setDesc,
  // 19.1.2.3 / 15.2.3.7 Object.defineProperties(O, Properties)
  defineProperties: defineProperties
});

  // IE 8- don't enum bug keys
var keys1 = require('./_enum-bug-keys')
  // Additional keys for getOwnPropertyNames
  , keys2 = keys1.concat('length', 'prototype');

var createGetKeys = function(names, length){
  return function(object){
    var O      = toIObject(object)
      , i      = 0
      , result = []
      , key;
    for(key in O)if(key != IE_PROTO)has(O, key) && result.push(key);
    // Don't enum bug & hidden keys
    while(length > i)if(has(O, key = names[i++])){
      ~arrayIndexOf(result, key) || result.push(key);
    }
    return result;
  };
};

$export($export.S, 'Object', {
  // 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)
  getOwnPropertyNames: $.getNames = $.getNames || createGetKeys(keys2, keys2.length),
  // 19.1.2.14 / 15.2.3.14 Object.keys(O)
  keys: $.getKeys = $.getKeys || createGetKeys(keys1, keys1.length)
});

//require('./es5.object.define-property');
//require('./es5.object.define-properties');
//require('./es5.object.get-own-property-descriptor');
require('./es5.object.create');
require('./es5.object.get-prototype-of');
//require('./es5.object.keys');
//require('./es5.object.get-own-property-names');
require('./es5.function.bind');
require('./es5.array.is-array');
require('./es5.array.slice');
require('./es5.array.join');
require('./es5.array.for-each');
require('./es5.array.map');
require('./es5.array.filter');
require('./es5.array.some');
require('./es5.array.every');
require('./es5.array.reduce');
require('./es5.array.reduce-right');
require('./es5.array.index-of');
require('./es5.array.last-index-of');
require('./es5.date.now');
require('./es5.date.to-iso-string');