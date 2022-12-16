var call = require('../internals/function-call');

module.exports = function (iterator, fn, $next) {
  var next = $next || iterator.next;
  var step, result;
  while (!(step = call(next, iterator)).done) {
    result = fn(step.value);
    if (result !== undefined) return result;
  }
};
