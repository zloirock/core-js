var $           = require('./_')
  , $export     = require('./_export')
  , DESCRIPTORS = require('./_descriptors')
  , createDesc  = require('./_property-desc')
  , has         = require('./_has')
  , gOPD        = $.getDesc
  , IE8_DOM_DEFINE;

var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(O, P){
  if(IE8_DOM_DEFINE)try {
    return gOPD(O, P);
  } catch(e){ /* empty */ }
  if(has(O, P))return createDesc(!$.isEnum.call(O, P), O[P]);
};

if(!DESCRIPTORS){
  IE8_DOM_DEFINE = !require('./_ie8-dom-define');
  $.getDesc = $getOwnPropertyDescriptor;
}

// 19.1.2.6 / 15.2.3.3 Object.getOwnPropertyDescriptor(O, P)
$export($export.S + $export.F * !DESCRIPTORS, 'Object', {getOwnPropertyDescriptor: $getOwnPropertyDescriptor});