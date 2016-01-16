var $           = require('./_')
  , $export     = require('./_export')
  , DESCRIPTORS = require('./_descriptors')
  , createDesc  = require('./_property-desc')
  , has         = require('./_has')
  , fails       = require('./_fails')
  , anObject    = require('./_an-object')
  , dP          = $.setDesc
  , gOPD        = $.getDesc
  , IE8_DOM_DEFINE;

if(!DESCRIPTORS){
  IE8_DOM_DEFINE = !fails(function(){
    return dP(require('./_dom-create')('div'), 'a', {get: function(){ return 7; }}).a != 7;
  });
  $.setDesc = function defineProperty(O, P, Attributes){
    if(IE8_DOM_DEFINE)try {
      return dP(O, P, Attributes);
    } catch(e){ /* empty */ }
    if('get' in Attributes || 'set' in Attributes)throw TypeError('Accessors not supported!');
    if('value' in Attributes)anObject(O)[P] = Attributes.value;
    return O;
  };
  $.getDesc = function getOwnPropertyDescriptor(O, P){
    if(IE8_DOM_DEFINE)try {
      return gOPD(O, P);
    } catch(e){ /* empty */ }
    if(has(O, P))return createDesc(!Object.prototype.propertyIsEnumerable.call(O, P), O[P]);
  };
  $.setDescs = function defineProperties(O, Properties){
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
  defineProperties: $.setDescs
});

//require('./es5.object.define-property');
//require('./es5.object.define-properties');
//require('./es5.object.get-own-property-descriptor');
require('./es5.object.create');
require('./es5.object.get-prototype-of');
require('./es5.object.keys');
require('./es5.object.get-own-property-names');
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