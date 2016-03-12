var TO_PRIMITIVE = require('./_wks')('toPrimitive')
  , proto        = Date.prototype;

if(!(TO_PRIMITIVE in proto))require('./_redefine')(proto, TO_PRIMITIVE, require('./_date-to-primitive'));