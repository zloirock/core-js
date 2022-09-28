var NATIVE_BIND = require('../internals/function-bind-native');

var FunctionPrototype = Function.prototype;
var bind = FunctionPrototype.bind;
var call = FunctionPrototype.call;
var uncurryThis = NATIVE_BIND && bind.bind(call, call);

module.exports = function (fn) {
  var isNativeFunction = fn instanceof Function;
  // Nashorn bug:
  //   https://github.com/zloirock/core-js/issues/1128
  //   https://github.com/zloirock/core-js/issues/1130
  if (!isNativeFunction) return;
  return NATIVE_BIND
    ? uncurryThis(fn)
    : function () {
      return call.apply(fn, arguments);
    };
};
