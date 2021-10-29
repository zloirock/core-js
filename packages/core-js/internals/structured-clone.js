'use strict';
var isSymbol = require('../internals/is-symbol');
var classof = require('../internals/classof');
var getBuiltin = require('../internals/get-built-in');
var isObject = require('../internals/is-object');
var hasOwn = require('../internals/has-own-property');
var createNonEnumerableProperty = require('../internals/create-non-enumerable-property');
var isArrayBufferDetached = require('../internals/array-buffer-is-deatched');
var ERROR_STACK_INSTALLABLE = require('../internals/error-stack-installable');

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
  // effectively preserves circular references
  if (map.has(value)) return map.get(value);

  var cloned, deep, key;
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
      if (isArrayBufferDetached(value)) throw createDataCloneError('ArrayBuffer is deatched');
      // falls through
    case 'SharedArrayBuffer':
      cloned = value.slice(0);
      break;
    case 'Blob':
      cloned = value.slice(0, value.size, value.type);
      break;
    case 'DataView':
      // eslint-disable-next-line es/no-typed-arrays -- ok
      cloned = new DataView(structuredCloneInternal(map, value.buffer), value.byteOffset, value.byteLength);
      break;
    case 'Int8Array':
    case 'Uint8Array':
    case 'Uint8ClampedArray':
    case 'Int16Array':
    case 'Uint16Array':
    case 'Int32Array':
    case 'Uint32Array':
    case 'Float32Array':
    case 'Float64Array':
    case 'BigInt64Array':
    case 'BigUint64Array':
      // this is safe, since arraybuffer cannot have circular references
      cloned = new value.constructor(structuredCloneInternal(map, value.buffer), value.byteOffset, value.length);
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
      if (ERROR_STACK_INSTALLABLE) createNonEnumerableProperty(cloned, 'stack', structuredCloneInternal(map, value.stack));
      break;
    case 'Array':
    case 'Object':
      for (key in value) if (hasOwn(value, key)) {
        cloned[key] = structuredCloneInternal(map, value[key]);
      }
      break;
  }

  return cloned;
};
