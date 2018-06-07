'use strict';
// `WeakSet` constructor
// https://tc39.github.io/ecma262/#sec-weakset-constructor
require('../internals/collection')('WeakSet', function (get) {
  return function WeakSet() { return get(this, arguments.length > 0 ? arguments[0] : undefined); };
}, require('../internals/collection-weak'), false, true);
