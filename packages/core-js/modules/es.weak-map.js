'use strict';
var forEach = require('../internals/array-methods')(0);
var redefine = require('../internals/redefine');
var InternalMetadataModule = require('../internals/internal-metadata');
var weak = require('../internals/collection-weak');
var isObject = require('../internals/is-object');
var fails = require('../internals/fails');
var enforceIternalState = require('../internals/internal-state').enforce;
var WEAK_MAP = 'WeakMap';
var isExtensible = Object.isExtensible;
var test = {};
var InternalWeakMap;

var wrapper = function (get) {
  return function WeakMap() {
    return get(this, arguments.length > 0 ? arguments[0] : undefined);
  };
};

// 23.3 WeakMap Objects
var $WeakMap = module.exports = require('../internals/collection')(WEAK_MAP, wrapper, weak, true, true);

// IE11 WeakMap frozen keys fix
if (fails(function () { return new $WeakMap().set((Object.freeze || Object)(test), 7).get(test) != 7; })) {
  InternalWeakMap = weak.getConstructor(wrapper, WEAK_MAP, true);
  InternalMetadataModule.REQUIRED = true;
  forEach(['delete', 'has', 'get', 'set'], function (METHOD_NAME) {
    var WeakMapPrototype = $WeakMap.prototype;
    var method = WeakMapPrototype[METHOD_NAME];
    redefine(WeakMapPrototype, METHOD_NAME, function (a, b) {
      // store frozen objects on internal weakmap shim
      if (isObject(a) && !isExtensible(a)) {
        var state = enforceIternalState(this);
        if (!state.frozen) state.frozen = new InternalWeakMap();
        var result = state.frozen[METHOD_NAME](a, b);
        return METHOD_NAME == 'set' ? this : result;
      // store all the rest on native weakmap
      } return method.call(this, a, b);
    });
  });
}
