var $    = require('./$')
  , $def = require('./$.def');
var objectStatic = {
  // 19.1.3.1 Object.assign(target, source)
  assign: require('./$.assign'),
  // 19.1.3.10 Object.is(value1, value2)
  is: function(x, y){
    return x === y ? x !== 0 || 1 / x === 1 / y : x != x && y != y;
  }
};
// 19.1.3.19 Object.setPrototypeOf(O, proto)
// Works with __proto__ only. Old v8 can't works with null proto objects.
'__proto__' in {} && function(buggy, set){
  try {
    set = $.ctx(Function.call, $.getDesc(Object.prototype, '__proto__').set, 2);
    set({}, []);
  } catch(e){ buggy = true }
  objectStatic.setPrototypeOf = $.setProto = $.setProto || function(O, proto){
    $.assert.obj(O);
    $.assert(proto === null || $.isObject(proto), proto, ": can't set as prototype!");
    if(buggy)O.__proto__ = proto;
    else set(O, proto);
    return O;
  }
}();
$def($def.S, 'Object', objectStatic);