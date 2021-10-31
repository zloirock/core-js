'use strict';
var global = require('../internals/global');
var getBuiltin = require('../internals/get-built-in');
var uncurryThis = require('../internals/function-uncurry-this');
var isObject = require('../internals/is-object');
var isSymbol = require('../internals/is-symbol');
var classof = require('../internals/classof');
var hasOwn = require('../internals/has-own-property');
var createNonEnumerableProperty = require('../internals/create-non-enumerable-property');
var isArrayBufferDetached = require('../internals/array-buffer-is-deatched');
var ERROR_STACK_INSTALLABLE = require('../internals/error-stack-installable');

var Object = global.Object;
var Date = global.Date;
var Error = global.Error;
var EvalError = global.EvalError;
var RangeError = global.RangeError;
var ReferenceError = global.ReferenceError;
var SyntaxError = global.SyntaxError;
var TypeError = global.TypeError;
var URIError = global.URIError;
var Set = getBuiltin('Set');
var Map = getBuiltin('Map');
var MapPrototype = Map.prototype;
var mapHas = uncurryThis(MapPrototype.has);
var mapGet = uncurryThis(MapPrototype.get);
var mapSet = uncurryThis(MapPrototype.set);
var setAdd = uncurryThis(Set.prototype.add);
var bolleanValueOf = uncurryThis(true.valueOf);
var numberValueOf = uncurryThis(1.0.valueOf);
var stringValueOf = uncurryThis(''.valueOf);
var getTime = uncurryThis(Date.prototype.getTime);

var createDataCloneError = function (message) {
  if (typeof DOMException === 'function') {
    return new DOMException(message, 'DataCloneError');
  }
  return new Error(message);
};

/**
 * Tries best to replicate structuredClone behaviour.
 *
 * @param {Map<object, object>} map cache map
 * @param {any} value object to clone
 */
var structuredCloneInternal = module.exports = function (map, value) {
  if (isSymbol(value)) throw createDataCloneError('Symbols are not cloneable');
  if (!isObject(value)) return value;
  // effectively preserves circular references
  if (mapHas(map, value)) return mapGet(map, value);

  var C, cloned, deep, key;
  var type = classof(value);

  switch (type) {
    case 'BigInt':
      // can be a 3rd party polyfill
      cloned = Object(value.valueOf());
      break;
    case 'Boolean':
      cloned = Object(bolleanValueOf(value));
      break;
    case 'Number':
      cloned = Object(numberValueOf(value));
      break;
    case 'String':
      cloned = Object(stringValueOf(value));
      break;
    case 'Date':
      cloned = new Date(getTime(value));
      break;
    case 'RegExp':
      cloned = new RegExp(value);
      break;
    case 'ArrayBuffer':
    case 'SharedArrayBuffer':
      if (isArrayBufferDetached(value)) throw createDataCloneError('ArrayBuffer is deatched');
      // SharedArrayBuffer should use shared memory, we can't polyfill it, so return the original
      cloned = type === 'SharedArrayBuffer' ? value : value.slice(0);
      break;
    case 'DataView':
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
      cloned = new global[type](
        // this is safe, since arraybuffer cannot have circular references
        structuredCloneInternal(map, value.buffer),
        value.byteOffset,
        type === 'DataView' ? value.byteLength : value.length
      );
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
      switch (value.name) {
        case 'Error':
          C = Error;
          break;
        case 'EvalError':
          C = EvalError;
          break;
        case 'RangeError':
          C = RangeError;
          break;
        case 'ReferenceError':
          C = ReferenceError;
          break;
        case 'SyntaxError':
          C = SyntaxError;
          break;
        case 'TypeError':
          C = TypeError;
          break;
        case 'URIError':
          C = URIError;
          break;
        default:
          C = Error;
      }
      cloned = C(value.message);
      deep = true; // clone stack after storing in the map
      break;
    case 'Array':
      cloned = [];
      deep = true;
      break;
    case 'Object':
      cloned = {};
      deep = true;
      break;
    case 'Blob':
      cloned = value.slice(0, value.size, value.type);
      break;
    case 'DOMException':
      cloned = new (getBuiltin('DOMException'))(value.message, value.name);
      deep = true; // clone stack after storing in the map
      break;
    case 'DOMPoint':
    case 'DOMPointReadOnly':
      cloned = global[type].fromPoint(value);
      break;
    case 'DOMQuad':
      cloned = new DOMQuad(
        structuredCloneInternal(map, value.p1),
        structuredCloneInternal(map, value.p2),
        structuredCloneInternal(map, value.p3),
        structuredCloneInternal(map, value.p4)
      );
      break;
    case 'DOMRect':
    case 'DOMRectReadOnly':
      cloned = global[type].fromRect(value);
      break;
    case 'DOMMatrix':
    case 'DOMMatrixReadOnly':
      cloned = global[type].fromMatrix(value);
      break;
    case 'AudioData':
    case 'VideoFrame':
      // reference to the same media resource as the original
      cloned = value.clone();
      break;
    case 'File':
      cloned = new File(
        [value],
        value.name,
        { type: value.type, lastModified: value.lastModified }
      );
      break;
    case 'ImageData':
      cloned = new ImageData(
        structuredCloneInternal(map, value.data),
        value.width,
        value.height,
        { colorSpace: value.colorSpace }
      );
      break;
    default:
      throw createDataCloneError('Uncloneable type: ' + type);
  }

  mapSet(map, value, cloned);

  if (deep) switch (type) {
    case 'Map':
      value.forEach(function (v, k) {
        mapSet(cloned, structuredCloneInternal(map, k), structuredCloneInternal(map, v));
      });
      break;
    case 'Set':
      value.forEach(function (v) {
        setAdd(cloned, structuredCloneInternal(map, v));
      });
      break;
    case 'Error':
    case 'DOMException':
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
