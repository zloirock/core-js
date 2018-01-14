'use strict';
// 23.4 WeakSet Objects
require('./_collection')('WeakSet', function (get) {
  return function WeakSet() { return get(this, arguments.length > 0 ? arguments[0] : undefined); };
}, require('./_collection-weak'), false, true);
