var NATIVE_BIND = require('../internals/function-bind-native');

var $Function = Function;
var FunctionPrototype = $Function.prototype;
var bind = FunctionPrototype.bind;
var call = FunctionPrototype.call;
var uncurryThis = NATIVE_BIND && bind.bind(call, call);

module.exports = function (fn) {
  // Nashorn bug:
  //   https://github.com/zloirock/core-js/issues/1128
  //   https://github.com/zloirock/core-js/issues/1130
  return fn instanceof $Function ? NATIVE_BIND ? uncurryThis(fn) : function () {
    return call.apply(fn, arguments);
  } : undefined;
};
