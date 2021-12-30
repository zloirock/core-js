var FunctionPrototype = Function.prototype;
var bind = FunctionPrototype.bind;
var call = FunctionPrototype.call;
var callBind = bind && bind.bind(call, call);

module.exports = bind ? callBind : function (fn) {
  return fn && function () {
    return call.apply(fn, arguments);
  };
};
