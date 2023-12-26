'use strict';
var defineBuiltIns = require('../internals/define-built-ins');
var anInstance = require('../internals/an-instance');
var anObject = require('../internals/an-object');
var isNullOrUndefined = require('../internals/is-null-or-undefined');
var isObject = require('../internals/is-object');
var iterate = require('../internals/iterate');
var MapNativeModule = require('../internals/map-native');
var WeakMapNativeModule = require('../internals/weak-map-native');
var setInternalState = require('../internals/internal-state').set;
var internalStateGetterFor = require('../internals/internal-state-getter-for');
// IE11 WeakMap does not support adding frozen keys, detection of this crashes some IE versions
var IS_IE11 = require('../internals/environment-is-ie11');
// adding frozen arrays to WeakMap in Chakra Edge unfreeze them
var WEAK_COLLECTIONS_UNFREEZING_BUG = require('../internals/weak-collections-unfreezing-bug');

var Map = MapNativeModule.Map;
var mapHas = MapNativeModule.has;
var mapGet = MapNativeModule.get;
var mapSet = MapNativeModule.set;
var mapDelete = MapNativeModule.remove;

var WeakMap = WeakMapNativeModule.WeakMap;
var weakMapHas = WeakMapNativeModule.has;
var weakMapGet = WeakMapNativeModule.get;
var weakMapSet = WeakMapNativeModule.set;
var weakMapDelete = WeakMapNativeModule.remove;

var $Object = Object;
var isArray = Array.isArray;
// eslint-disable-next-line es/no-object-isextensible -- safe
var isExtensible = $Object.isExtensible;
// eslint-disable-next-line es/no-object-isfrozen -- safe
var isFrozen = $Object.isFrozen;
// eslint-disable-next-line es/no-object-issealed -- safe
var isSealed = $Object.isSealed;
var freeze = $Object.freeze;
var seal = $Object.seal;

module.exports = {
  getConstructor: function (wrapper, CONSTRUCTOR_NAME, IS_MAP, ADDER) {
    var Constructor = wrapper(function (that, iterable) {
      anInstance(that, Prototype);
      setInternalState(that, {
        type: CONSTRUCTOR_NAME,
        weakmap: new WeakMap(),
        map: IS_IE11 ? new Map() : null,
      });
      // dependency: es.array.iterator
      // dependency: web.dom-collections.iterator
      if (!isNullOrUndefined(iterable)) iterate(iterable, that[ADDER], { that: that, AS_ENTRIES: IS_MAP });
    });

    var Prototype = Constructor.prototype;

    var getInternalState = internalStateGetterFor(CONSTRUCTOR_NAME);

    var define = function (that, key, value) {
      var state = getInternalState(that);
      var arrayIntegrityLevel;
      anObject(key);
      if (WEAK_COLLECTIONS_UNFREEZING_BUG && isArray(key)) {
        if (isFrozen(key)) arrayIntegrityLevel = freeze;
        else if (isSealed(key)) arrayIntegrityLevel = seal;
      }
      if (IS_IE11 && !isExtensible(key) && !weakMapHas(state.weakmap, key)) {
        mapSet(state.map, key, value);
      } else {
        weakMapSet(state.weakmap, key, value);
      }
      if (arrayIntegrityLevel) arrayIntegrityLevel(key);
      return that;
    };

    defineBuiltIns(Prototype, {
      // `{ WeakMap, WeakSet }.prototype.delete(key)` methods
      // https://tc39.es/ecma262/#sec-weakmap.prototype.delete
      // https://tc39.es/ecma262/#sec-weakset.prototype.delete
      delete: function (key) {
        var state = getInternalState(this);
        if (!isObject(key)) return false;
        return weakMapDelete(state.weakmap, key) || IS_IE11 && mapDelete(state.map, key);
      },
      // `{ WeakMap, WeakSet }.prototype.has(key)` methods
      // https://tc39.es/ecma262/#sec-weakmap.prototype.has
      // https://tc39.es/ecma262/#sec-weakset.prototype.has
      has: function has(key) {
        var state = getInternalState(this);
        if (!isObject(key)) return false;
        return weakMapHas(state.weakmap, key) || IS_IE11 && mapHas(state.map, key);
      },
    });

    defineBuiltIns(Prototype, IS_MAP ? {
      // `WeakMap.prototype.get(key)` method
      // https://tc39.es/ecma262/#sec-weakmap.prototype.get
      get: function get(key) {
        var state = getInternalState(this);
        var weakmap = state.weakmap;
        if (!isObject(key)) return;
        return !IS_IE11 || weakMapHas(weakmap, key) ? weakMapGet(weakmap, key) : mapGet(state.map, key);
      },
      // `WeakMap.prototype.set(key, value)` method
      // https://tc39.es/ecma262/#sec-weakmap.prototype.set
      set: function set(key, value) {
        return define(this, key, value);
      },
    } : {
      // `WeakSet.prototype.add(value)` method
      // https://tc39.es/ecma262/#sec-weakset.prototype.add
      add: function add(value) {
        return define(this, value, true);
      },
    });

    return Constructor;
  },
};
