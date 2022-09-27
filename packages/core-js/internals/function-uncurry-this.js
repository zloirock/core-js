var fails = require('../internals/fails');
var NATIVE_BIND = require('../internals/function-bind-native');

var FunctionPrototype = Function.prototype;
var bind = FunctionPrototype.bind;
var call = FunctionPrototype.call;
var uncurryThis = NATIVE_BIND && bind.bind(call, call);

var UNCURRY_WITH_NATIVE_BIND = NATIVE_BIND && !fails(function () {
  // Nashorn bug, https://github.com/zloirock/core-js/issues/1128
  return uncurryThis(''.slice)('12', 1) !== '2';
});

module.exports = UNCURRY_WITH_NATIVE_BIND ? function (fn) {
  return fn && uncurryThis(fn);
} : function (fn) {
  return fn && function () {
    return call.apply(fn, arguments);
  };
};
