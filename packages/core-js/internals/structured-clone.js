/* eslint-disable es/no-map -- safe */
/* eslint-disable es/no-set -- safe */
/* eslint-disable no-new-wrappers -- safe */
/* eslint-disable es/no-bigint -- safe */
'use const';
var isSymbol = require('./is-symbol');
var toObject = require('./to-object');
var getOwnPropertyNames = require('./object-get-own-property-names');
var classof = require('./classof');

function createDataCloneError(message) {
  if (typeof DOMException === 'function') {
    return new DOMException(message, 'DataCloneError');
  }
  return new Error(message);
}

/**
 * Tries best to replicate structuredClone behaviour.
 *
 * @param {WeakMap} weakmap cache map
 * @param {any} value object to clone
 */
module.exports = function structuredCloneInternal(weakmap, value) {
  if (isSymbol(value)) throw createDataCloneError('Symbols are not cloneable');
  if (typeof value !== 'function' && typeof value !== 'object') return value;
  if (value === null) return null;
  if (weakmap.has(value)) return weakmap.get(value); // effectively preserves circular references

  var cloned, i, deep;

  switch (classof(value)) {
    case 'Boolean':
    case 'BigInt':
    case 'Number':
    case 'String':
      cloned = toObject(value.valueOf());
      break;
    case 'Date':
      cloned = new Date(value.valueOf());
      break;
    case 'RegExp':
      cloned = new RegExp(value);
      break;
    case 'Map':
      cloned = new Map();
      deep = true;
      break;
    case 'Set':
      cloned = new Set();
      deep = true;
      break;
    case 'Array':
      cloned = [];
      deep = true;
      break;
    case 'Object':
      cloned = {};
      deep = true;
      break;
    default:
      throw createDataCloneError('Uncloneable type: ' + classof(value));
  }

  weakmap.set(value, cloned);

  if (deep) switch (classof(value)) {
    case 'Map':
      value.forEach(function (v, k) {
        cloned.set(structuredCloneInternal(weakmap, k), structuredCloneInternal(weakmap, v));
      });
      break;
    case 'Set':
      value.forEach(function (v) {
        cloned.add(structuredCloneInternal(weakmap, v));
      });
      break;
    case 'Array':
    case 'Object':
      var properties = getOwnPropertyNames.f(value);
      for (i = 0; i < properties.length; i++) {
        cloned[structuredCloneInternal(weakmap, properties[i])] =
          structuredCloneInternal(weakmap, value[properties[i]]);
      }
      break;
  }

  return cloned;
};
