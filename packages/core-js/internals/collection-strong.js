'use strict';
var defineBuiltInAccessor = require('../internals/define-built-in-accessor');
var defineBuiltIn = require('../internals/define-built-in');
var defineBuiltIns = require('../internals/define-built-ins');
var bind = require('../internals/function-bind-context');
var anInstance = require('../internals/an-instance');
var isNullOrUndefined = require('../internals/is-null-or-undefined');
var iterate = require('../internals/iterate');
var normalizeIteratorMethod = require('../internals/iterator-normalize-method');
var createIteratorConstructor = require('../internals/iterator-create-constructor');
var createIterResultObject = require('../internals/create-iter-result-object');
var MapNativeModule = require('../internals/map-native');
var setInternalState = require('../internals/internal-state').set;
var internalStateGetterFor = require('../internals/internal-state-getter-for');
var wellKnownSymbol = require('../internals/well-known-symbol');

var ITERATOR = wellKnownSymbol('iterator');

var Map = MapNativeModule.Map;
var mapGet = MapNativeModule.get;
var mapSet = MapNativeModule.set;
var mapDelete = MapNativeModule.remove;

var normalizeKey = function (key) {
  return key === 0 ? 0 : key;
};

module.exports = {
  getConstructor: function (wrapper, CONSTRUCTOR_NAME, IS_MAP, ADDER) {
    var Constructor = wrapper(function (that, iterable) {
      anInstance(that, Prototype);
      setInternalState(that, {
        type: CONSTRUCTOR_NAME,
        index: new Map(),
        first: null,
        last: null,
        size: 0,
      });
      // dependency: es.array.iterator
      // dependency: es.string.iterator
      // dependency: web.dom-collections.iterator
      if (!isNullOrUndefined(iterable)) iterate(iterable, that[ADDER], { that: that, AS_ENTRIES: IS_MAP });
    });

    var Prototype = Constructor.prototype;

    var getInternalState = internalStateGetterFor(CONSTRUCTOR_NAME);

    var define = function (that, $key, value) {
      var state = getInternalState(that);
      var key = normalizeKey($key);
      var entry = getEntry(that, key);
      var previous;
      // change existing entry
      if (entry) {
        entry.value = value;
      // create new entry
      } else {
        state.last = entry = {
          key: key,
          value: value,
          previous: previous = state.last,
          next: null,
          removed: false,
        };
        if (!state.first) state.first = entry;
        if (previous) previous.next = entry;
        state.size++;
        mapSet(state.index, key, entry);
      } return that;
    };

    var getEntry = function (that, key) {
      return mapGet(getInternalState(that).index, normalizeKey(key));
    };

    var ITERATOR_NAME = CONSTRUCTOR_NAME + ' Iterator';
    var getInternalCollectionState = internalStateGetterFor(CONSTRUCTOR_NAME);
    var getInternalIteratorState = internalStateGetterFor(ITERATOR_NAME);

    var Iterator = createIteratorConstructor(function (iterated, kind) {
      setInternalState(this, {
        type: ITERATOR_NAME,
        target: iterated,
        state: getInternalCollectionState(iterated),
        kind: kind,
        last: null,
      });
    }, CONSTRUCTOR_NAME, function () {
      var state = getInternalIteratorState(this);
      var kind = state.kind;
      var entry = state.last;
      // revert to the last existing entry
      while (entry && entry.removed) entry = entry.previous;
      // get next entry
      if (!state.target || !(state.last = entry = entry ? entry.next : state.state.first)) {
        // or finish the iteration
        state.target = null;
        return createIterResultObject(undefined, true);
      }
      // return step by kind
      if (kind === 'keys') return createIterResultObject(entry.key, false);
      if (kind === 'values') return createIterResultObject(entry.value, false);
      return createIterResultObject([entry.key, entry.value], false);
    });

    var $values = function values() {
      return new Iterator(this, 'values');
    };

    var $entries = function entries() {
      return new Iterator(this, 'entries');
    };

    defineBuiltIns(Prototype, {
      // `{ Map, Set }.prototype.clear()` methods
      // https://tc39.es/ecma262/#sec-map.prototype.clear
      // https://tc39.es/ecma262/#sec-set.prototype.clear
      clear: function clear() {
        var state = getInternalState(this);
        var entry = state.first;
        while (entry) {
          entry.removed = true;
          if (entry.previous) entry.previous = entry.previous.next = null;
          entry = entry.next;
        }
        state.first = state.last = null;
        state.index = new Map();
        state.size = 0;
      },
      // `{ Map, Set }.prototype.delete(key)` methods
      // https://tc39.es/ecma262/#sec-map.prototype.delete
      // https://tc39.es/ecma262/#sec-set.prototype.delete
      delete: function (key) {
        var state = getInternalState(this);
        var entry = getEntry(this, key);
        if (entry) {
          var next = entry.next;
          var prev = entry.previous;
          mapDelete(state.index, entry.key);
          entry.removed = true;
          if (prev) prev.next = next;
          if (next) next.previous = prev;
          if (state.first === entry) state.first = next;
          if (state.last === entry) state.last = prev;
          state.size--;
        } return !!entry;
      },
      // `{ Map, Set }.prototype.forEach(callbackfn, thisArg = undefined)` methods
      // https://tc39.es/ecma262/#sec-map.prototype.foreach
      // https://tc39.es/ecma262/#sec-set.prototype.foreach
      forEach: function forEach(callbackfn /* , that = undefined */) {
        var state = getInternalState(this);
        var boundFunction = bind(callbackfn, arguments.length > 1 ? arguments[1] : undefined);
        var entry;
        while (entry = entry ? entry.next : state.first) {
          boundFunction(entry.value, entry.key, this);
          // revert to the last existing entry
          while (entry && entry.removed) entry = entry.previous;
        }
      },
      // `{ Map, Set}.prototype.has(key)` methods
      // https://tc39.es/ecma262/#sec-map.prototype.has
      // https://tc39.es/ecma262/#sec-set.prototype.has
      has: function has(key) {
        return !!getEntry(this, key);
      },
      // `{ Map, Set }.prototype.values()` methods
      // https://tc39.es/ecma262/#sec-map.prototype.values
      // https://tc39.es/ecma262/#sec-set.prototype.values
      values: $values,
      // `{ Map, Set }.prototype.keys()` methods
      // https://tc39.es/ecma262/#sec-map.prototype.keys
      // https://tc39.es/ecma262/#sec-set.prototype.keys
      keys: IS_MAP ? function keys() {
        return new Iterator(this, 'keys');
      } : $values,
      // `{ Map, Set }.prototype.entries()` methods
      // https://tc39.es/ecma262/#sec-map.prototype.entries
      // https://tc39.es/ecma262/#sec-set.prototype.entries
      entries: $entries,
    });

    defineBuiltIns(Prototype, IS_MAP ? {
      // `Map.prototype.get(key)` method
      // https://tc39.es/ecma262/#sec-map.prototype.get
      get: function get(key) {
        var entry = getEntry(this, key);
        return entry && entry.value;
      },
      // `Map.prototype.set(key, value)` method
      // https://tc39.es/ecma262/#sec-map.prototype.set
      set: function set(key, value) {
        return define(this, key === 0 ? 0 : key, value);
      },
    } : {
      // `Set.prototype.add(value)` method
      // https://tc39.es/ecma262/#sec-set.prototype.add
      add: function add(value) {
        return define(this, value = value === 0 ? 0 : value, value);
      },
    });

    defineBuiltIn(Prototype, ITERATOR, IS_MAP ? $entries : $values, { name: IS_MAP ? 'entries' : 'values' });

    defineBuiltInAccessor(Prototype, 'size', {
      configurable: true,
      get: function () {
        return getInternalState(this).size;
      },
    });
    return Constructor;
  },
  ensureIterators: function (Constructor, CONSTRUCTOR_NAME, IS_MAP) {
    try {
      var keys = normalizeIteratorMethod(Constructor, CONSTRUCTOR_NAME, 'keys');
      var values = normalizeIteratorMethod(Constructor, CONSTRUCTOR_NAME, 'values');
      var entries = normalizeIteratorMethod(Constructor, CONSTRUCTOR_NAME, 'entries');

      if (!keys || !values || !entries) return;

      var defaultIterator = IS_MAP ? entries : values;

      if (Constructor.prototype[ITERATOR] !== defaultIterator) {
        defineBuiltIn(Constructor.prototype, ITERATOR, defaultIterator, { name: IS_MAP ? 'entries' : 'values' });
      }

      return true;
    } catch (error) { /* empty */ }
  },
};
