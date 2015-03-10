// Works with __proto__ only. Old v8 can't works with null proto objects.
var $      = require('./$')
  , assert = require('./$.assert');
module.exports = Object.setPrototypeOf || ('__proto__' in {} ? function(buggy, set){
  try {
    set = require('./$.ctx')(Function.call, $.getDesc(Object.prototype, '__proto__').set, 2);
    set({}, []);
  } catch(e){ buggy = true }
  return function(O, proto){
    assert.obj(O);
    assert(proto === null || $.isObject(proto), proto, ": can't set as prototype!");
    if(buggy)O.__proto__ = proto;
    else set(O, proto);
    return O;
  }
}() : undefined);