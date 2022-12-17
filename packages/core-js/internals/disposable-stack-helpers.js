var uncurryThis = require('../internals/function-uncurry-this');
var bind = require('../internals/function-bind-context');
var anObject = require('../internals/an-object');
var isNullOrUndefined = require('../internals/is-null-or-undefined');
var getMethod = require('../internals/get-method');
var wellKnownSymbol = require('../internals/well-known-symbol');

var ASYNC_DISPOSE = wellKnownSymbol('asyncDispose');
var DISPOSE = wellKnownSymbol('dispose');

var push = uncurryThis([].push);

var getDisposeMethod = function (V, hint) {
  if (hint == 'async-dispose') {
    return getMethod(V, ASYNC_DISPOSE) || getMethod(V, DISPOSE);
  } return getMethod(V, DISPOSE);
};

var createDisposableResource = function (V, hint, method) {
  return bind(method || getDisposeMethod(V, hint), V);
};

var addDisposableResource = function (disposable, V, hint, method) {
  var resource;
  if (!method) {
    if (isNullOrUndefined(V)) return;
    resource = createDisposableResource(V, hint);
  } else if (isNullOrUndefined(V)) {
    resource = createDisposableResource(undefined, hint, method);
  } else {
    resource = createDisposableResource(anObject(V), hint, method);
  }

  push(disposable.stack, resource);
};

module.exports = {
  getDisposeMethod: getDisposeMethod,
  addDisposableResource: addDisposableResource
};
