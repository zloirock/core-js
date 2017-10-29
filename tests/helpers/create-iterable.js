global.createIterable = function (elements, methods) {
  var iterable = {
    called: false,
    received: false
  };
  iterable[global.core ? core.Symbol.iterator : global.Symbol && Symbol.iterator] = function () {
    iterable.received = true;
    var index = 0;
    var iterator = {
      next: function () {
        iterable.called = true;
        return {
          value: elements[index++],
          done: index > elements.length
        };
      }
    };
    if (methods) for (var key in methods) iterator[key] = methods[key];
    return iterator;
  };
  return iterable;
};
