// 19.1.3.19 Object.setPrototypeOf(O, proto)
var $def     = require('./$.def')
  , setProto = require('./$.set-proto');
if(setProto)$def($def.S, 'Object', {setPrototypeOf: setProto});