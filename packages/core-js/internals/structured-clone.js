/* eslint-disable es/no-map -- safe */
/* eslint-disable es/no-set -- safe */
/* eslint-disable no-new-wrappers -- safe */
/* eslint-disable es/no-bigint -- safe */
'use const';
var isSymbol = require('./is-symbol');
var isArray = require('./is-array');
var isObject = require('./is-object');
var getOwnPropertyNames = require('./object-get-own-property-names');

function createDataCloneError(message) {
  if (typeof DOMException === 'function') {
    return new DOMException(message, 'DataCloneError');
  }
  return new Error(message);
}

function structuredCloneInternal(weakmap, value) {
  if (isSymbol(value)) throw createDataCloneError('Symbols are not cloneable');
  if (typeof value !== 'function' && typeof value !== 'object') return value;
  if (value === null) return null;
  if (weakmap.has(value)) return weakmap.get(value); // effectively preserves circular references

  if (value instanceof Boolean) return new Boolean(value.valueOf());
  if (typeof BigInt === 'function' && value instanceof BigInt) return Object(value.valueOf());
  if (value instanceof Number) return new Number(value.valueOf());
  if (value instanceof String) return new String(value.valueOf());
  if (value instanceof Date) return new Date(value.valueOf());

  if (value instanceof RegExp) return new RegExp(value); // Not cloning [[RegExpMatcher]], but it will be created

  // TODO: SharedArrayBuffer, ArrayBuffer, DataView, etc

  if (typeof Map === 'function' && value instanceof Map) {
    var map = new Map();
    value.forEach(function (v, key) {
      map.set(structuredCloneInternal(key), structuredCloneInternal(weakmap, v));
    });
    return map;
  }

  if (typeof Set === 'function' && value instanceof Set) {
    var set = new Set();
    value.forEach(function (v) {
      set.add(structuredCloneInternal(weakmap, v));
    });
    return set;
  }

  if (isArray(value)) {
    return value.map(function (v) {
      return structuredCloneInternal(weakmap, v);
    });
  }

  if (isObject(value)) {
    var rv = {};
    getOwnPropertyNames.f(value).forEach(function (k) {
      rv[structuredCloneInternal(weakmap, k)] = structuredCloneInternal(weakmap, value[k]);
    });
    return rv;
  }

  return value; // TODO: REMOVE THIS
}

/**
 * Tries best to replicate structuredClone behaviour.
 *
 * @param {WeakMap} weakmap cache map
 * @param {any} value object to clone
 * @param {Array<Transferable>} transfer transferables, if any
 */
module.exports = function (weakmap, value, transfer) {
  // TODO: Implement transfer behaviours. Couldn't find a reliable way to do this.
  return structuredCloneInternal(weakmap, value);
};
