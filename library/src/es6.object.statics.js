var $def     = require('./$.def')
  , setProto = require('./$.set-proto');
var objectStatic = {
  // 19.1.3.1 Object.assign(target, source)
  assign: require('./$.assign'),
  // 19.1.3.10 Object.is(value1, value2)
  is: function(x, y){
    return x === y ? x !== 0 || 1 / x === 1 / y : x != x && y != y;
  }
};
// 19.1.3.19 Object.setPrototypeOf(O, proto)
if(setProto)objectStatic.setPrototypeOf = setProto;
$def($def.S, 'Object', objectStatic);