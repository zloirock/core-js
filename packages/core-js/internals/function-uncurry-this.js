var FunctionPrototype = Function.prototype;
var bind = FunctionPrototype.bind;
var call = FunctionPrototype.call;
var callBind = bind && bind.bind(call);

module.exports = bind ? function (fn) {
  return fn && callBind(call, fn);
} : function (fn) {
  return function () {
    return fn && call.apply(fn, arguments);
  };
};
