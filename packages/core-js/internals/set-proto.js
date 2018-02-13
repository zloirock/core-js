// Works with __proto__ only. Old v8 can't work with null proto objects.
/* eslint-disable no-proto */
var isObject = require('../internals/is-object');
var anObject = require('../internals/an-object');

var check = function (O, proto) {
  anObject(O);
  if (!isObject(proto) && proto !== null) throw TypeError(proto + ": can't set as a prototype!");
};

module.exports = {
  set: Object.setPrototypeOf || ('__proto__' in {} ? // eslint-disable-line
    function () {
      var test = {};
      var correctSetter = true;
      var setter;
      try {
        setter = Object.getOwnPropertyDescriptor(Object.prototype, '__proto__').set;
        setter.call(test, []);
        correctSetter = test instanceof Array;
      } catch (e) { correctSetter = false; }
      return function setPrototypeOf(O, proto) {
        check(O, proto);
        if (correctSetter) setter.call(O, proto);
        else O.__proto__ = proto;
        return O;
      };
    }() : undefined),
  check: check
};
