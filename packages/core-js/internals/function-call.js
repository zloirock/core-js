var call = Function.prototype.call;

module.exports = call.bind ? call.bind(call) : function () {
  return call.apply(call, arguments);
};
