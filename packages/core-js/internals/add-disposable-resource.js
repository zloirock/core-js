'use strict';
var call = require('../internals/function-call');
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
    var method = getMethod(V, ASYNC_DISPOSE);
    if (method !== undefined) return method;
    method = getMethod(V, DISPOSE);
    return function () {
      call(method, this);
    };
  } return getMethod(V, DISPOSE);
};

// `CreateDisposableResource` abstract operation
// https://tc39.es/proposal-explicit-resource-management/#sec-createdisposableresource
var createDisposableResource = function (V, hint, method) {
  return bind(method || getDisposeMethod(V, hint), V);
};

// `AddDisposableResource` abstract operation
// https://tc39.es/proposal-explicit-resource-management/#sec-adddisposableresource-disposable-v-hint-disposemethod
module.exports = function (disposable, V, hint, method) {
  var resource;
  if (!method) {
    if (isNullOrUndefined(V)) return;
    resource = createDisposableResource(anObject(V), hint);
  } else {
    resource = createDisposableResource(undefined, hint, method);
  }

  push(disposable.stack, resource);
};
