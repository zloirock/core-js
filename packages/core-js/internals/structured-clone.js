'use strict';
var IS_PURE = require('../internals/is-pure');
var global = require('../internals/global');
var getBuiltin = require('../internals/get-built-in');
var uncurryThis = require('../internals/function-uncurry-this');
var fails = require('../internals/fails');
var uid = require('../internals/uid');
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
var PerformanceMark = global.PerformanceMark;
var mapHas = uncurryThis(MapPrototype.has);
var mapGet = uncurryThis(MapPrototype.get);
var mapSet = uncurryThis(MapPrototype.set);
var setAdd = uncurryThis(Set.prototype.add);
var bolleanValueOf = uncurryThis(true.valueOf);
var numberValueOf = uncurryThis(1.0.valueOf);
var stringValueOf = uncurryThis(''.valueOf);
var getTime = uncurryThis(Date.prototype.getTime);
var PERFORMANCE_MARK = uid('structuredClone');

var structuredCloneFromMark = (function (structuredClone) {
  return !fails(function () {
    var set = new global.Set([42]);
    var cloned = structuredClone(set);
    return cloned === set || !set.has(42);
  }) && structuredClone;
})(function (value) {
  return new PerformanceMark(PERFORMANCE_MARK, { detail: value }).detail;
});

var nativeRestrictedStructuredClone = global.structuredClone || structuredCloneFromMark;

var USE_STRUCTURED_CLONE_FROM_MARK = !IS_PURE && !fails(function () {
  // current Safari implementation can't clone errors
  return structuredCloneFromMark(Error('a')).message !== 'a';
});

var createDataCloneError = function (message) {
  try {
    return new DOMException(message, 'DataCloneError');
  } catch (error) {
    return TypeError(message);
  }
};

/**
 * Tries best to replicate structuredClone behaviour.
 *
 * @param {Map<object, object>} map cache map
 * @param {any} value object to clone
 */
var structuredCloneInternal = module.exports = function (value, map) {
  if (isSymbol(value)) throw createDataCloneError('Symbols are not cloneable');
  if (!isObject(value)) return value;
  if (USE_STRUCTURED_CLONE_FROM_MARK) return structuredCloneFromMark(value);
  // effectively preserves circular references
  if (map) {
    if (mapHas(map, value)) return mapGet(map, value);
  } else map = new Map();

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
      cloned = type === 'ArrayBuffer' ? value.slice(0)
        // SharedArrayBuffer should use shared memory, we can't polyfill it, so return the original
        : nativeRestrictedStructuredClone ? nativeRestrictedStructuredClone(value) : value;
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
        structuredCloneInternal(value.buffer, map),
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
        structuredCloneInternal(value.p1, map),
        structuredCloneInternal(value.p2, map),
        structuredCloneInternal(value.p3, map),
        structuredCloneInternal(value.p4, map)
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
        structuredCloneInternal(value.data, map),
        value.width,
        value.height,
        { colorSpace: value.colorSpace }
      );
      break;
    default:
      if (nativeRestrictedStructuredClone) cloned = nativeRestrictedStructuredClone(value);
      else throw createDataCloneError('Uncloneable type: ' + type);
  }

  mapSet(map, value, cloned);

  if (deep) switch (type) {
    case 'Map':
      value.forEach(function (v, k) {
        mapSet(cloned, structuredCloneInternal(k, map), structuredCloneInternal(v, map));
      });
      break;
    case 'Set':
      value.forEach(function (v) {
        setAdd(cloned, structuredCloneInternal(v, map));
      });
      break;
    case 'Error':
    case 'DOMException':
      if (ERROR_STACK_INSTALLABLE) createNonEnumerableProperty(cloned, 'stack', structuredCloneInternal(value.stack, map));
      break;
    case 'Array':
    case 'Object':
      for (key in value) if (hasOwn(value, key)) {
        cloned[key] = structuredCloneInternal(value[key], map);
      }
      break;
  }

  return cloned;
};
