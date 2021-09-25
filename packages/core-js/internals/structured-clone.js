'use strict';
var isSymbol = require('../internals/is-symbol');
var getOwnPropertyNames = require('../internals/object-get-own-property-names');
var classof = require('../internals/classof');
var getBuiltin = require('../internals/get-built-in');
var isObject = require('../internals/is-object');
var has = require('../internals/has');
var isArrayBufferDetached = require('../internals/array-buffer-is-deatched');

var Set = getBuiltin('Set');
var Map = getBuiltin('Map');

function createDataCloneError(message) {
  if (typeof DOMException === 'function') {
    return new DOMException(message, 'DataCloneError');
  }
  return new Error(message);
}

/**
 * Tries best to replicate structuredClone behaviour.
 *
 * @param {Map<object, object>} map cache map
 * @param {any} value object to clone
 */
module.exports = function structuredCloneInternal(map, value) {
  if (isSymbol(value)) throw createDataCloneError('Symbols are not cloneable');
  if (!isObject(value)) return value;
  if (map.has(value)) return map.get(value); // effectively preserves circular references

  var cloned, i, deep;
  var type = classof(value);

  switch (type) {
    case 'Boolean':
    case 'BigInt':
    case 'Number':
    case 'String':
      cloned = Object(value.valueOf());
      break;
    case 'Date':
      cloned = new Date(value.valueOf());
      break;
    case 'RegExp':
      cloned = new RegExp(value);
      break;
    case 'ArrayBuffer':
      if (!isArrayBufferDetached()) throw createDataCloneError('ArrayBuffer is deatched');
      // falls through
    case 'SharedArrayBuffer':
    case 'Blob':
      cloned = value.slice(0);
      break;
    case 'Map':
      cloned = new Map();
      deep = true;
      break;
    case 'Set':
      cloned = new Set();
      deep = true;
      break;
    case 'Error':
      cloned = value.constructor(value.message.toString());
      deep = true; // clone stack after storing in the weakmap
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
      throw createDataCloneError('Uncloneable type: ' + type);
  }

  map.set(value, cloned);

  if (deep) switch (type) {
    case 'Map':
      value.forEach(function (v, k) {
        cloned.set(structuredCloneInternal(map, k), structuredCloneInternal(map, v));
      });
      break;
    case 'Set':
      value.forEach(function (v) {
        cloned.add(structuredCloneInternal(map, v));
      });
      break;
    case 'Error':
      // Attempt to clone the stack.
      if (
        !has(value, 'stack') && // Chrome, Safari
        !has(Error.prototype, 'stack') // Firefox
      ) break;
      try {
        cloned.stack = structuredCloneInternal(map, value.stack);
      } catch (_) {
        return cloned; // Stack cloning not avaliable.
      }
      break;
    case 'Array':
    case 'Object':
      var properties = getOwnPropertyNames.f(value);
      for (i = 0; i < properties.length; i++) {
        cloned[properties[i]] = structuredCloneInternal(map, value[properties[i]]);
      }
      break;
  }

  return cloned;
};
