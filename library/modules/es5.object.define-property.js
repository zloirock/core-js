var $           = require('./_')
  , $export     = require('./_export')
  , DESCRIPTORS = require('./_descriptors')
  , anObject    = require('./_an-object')
  , dP          = $.setDesc
  , IE8_DOM_DEFINE;

var $defineProperty = function defineProperty(O, P, Attributes){
  if(IE8_DOM_DEFINE)try {
    return dP(O, P, Attributes);
  } catch(e){ /* empty */ }
  if('get' in Attributes || 'set' in Attributes)throw TypeError('Accessors not supported!');
  if('value' in Attributes)anObject(O)[P] = Attributes.value;
  return O;
};

if(!DESCRIPTORS){
  IE8_DOM_DEFINE = !require('./_ie8-dom-define');
  $.setDesc = $defineProperty;
}

// 19.1.2.4 / 15.2.3.6 Object.defineProperty(O, P, Attributes)
$export($export.S + $export.F * !DESCRIPTORS, 'Object', {defineProperty: $defineProperty});