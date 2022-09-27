var fails = require('../internals/fails');
var NATIVE_BIND = require('../internals/function-bind-native');

var FunctionPrototype = Function.prototype;
var bind = FunctionPrototype.bind;
var call = FunctionPrototype.call;
var uncurryThis = NATIVE_BIND && bind.bind(call, call);

module.exports = function (fn) {
  // Nashorn bug, https://github.com/zloirock/core-js/issues/1128
  var isNativeFunction = fn instanceof Function;
  return (isNativeFunction && NATIVE_BIND)
    ? uncurryThis(fn)
    : function () {
      return call.apply(fn, arguments);
    };
};
