'use strict';
var each = require('../internals/array-methods')(0);
var redefine = require('../internals/redefine');
var meta = require('../internals/meta');
var weak = require('../internals/collection-weak');
var isObject = require('core-js-internals/is-object');
var fails = require('core-js-internals/fails');
var $ = require('../internals/state');
var WEAK_MAP = 'WeakMap';
var isExtensible = Object.isExtensible;
var tmp = {};
var InternalMap;

var wrapper = function (get) {
  return function WeakMap() {
    return get(this, arguments.length > 0 ? arguments[0] : undefined);
  };
};

// 23.3 WeakMap Objects
var $WeakMap = module.exports = require('../internals/collection')(WEAK_MAP, wrapper, weak, true, true);

// IE11 WeakMap frozen keys fix
if (fails(function () { return new $WeakMap().set((Object.freeze || Object)(tmp), 7).get(tmp) != 7; })) {
  InternalMap = weak.getConstructor(wrapper, WEAK_MAP, true);
  meta.NEED = true;
  each(['delete', 'has', 'get', 'set'], function (key) {
    var proto = $WeakMap.prototype;
    var method = proto[key];
    redefine(proto, key, function (a, b) {
      // store frozen objects on internal weakmap shim
      if (isObject(a) && !isExtensible(a)) {
        var state = $(this, true);
        if (!state.frozen) state.frozen = new InternalMap();
        var result = state.frozen[key](a, b);
        return key == 'set' ? this : result;
      // store all the rest on native weakmap
      } return method.call(this, a, b);
    });
  });
}
