'use strict';
var redefine     = require('./_redefine')
  , anObject     = require('./_an-object')
  , toPrimitive  = require('./_to-primitive')
  , TO_PRIMITIVE = require('./_wks')('toPrimitive')
  , proto        = Date.prototype
  , NUMBER       = 'number';

if(!(TO_PRIMITIVE in proto))redefine(proto, TO_PRIMITIVE, function(hint){
  if(hint !== 'string' && hint !== NUMBER && hint !== 'default')throw TypeError('Incorrect hint');
  return toPrimitive(anObject(this), hint != NUMBER);
});