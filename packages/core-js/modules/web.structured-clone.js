var IS_PURE = require('../internals/is-pure');
var $ = require('../internals/export');
var global = require('../internals/global');
var getBuiltin = require('../internals/get-built-in');
var uncurryThis = require('../internals/function-uncurry-this');
var fails = require('../internals/fails');
var uid = require('../internals/uid');
var isConstructor = require('../internals/is-constructor');
var isObject = require('../internals/is-object');
var isSymbol = require('../internals/is-symbol');
var anObject = require('../internals/an-object');
var classof = require('../internals/classof');
var hasOwn = require('../internals/has-own-property');
var createNonEnumerableProperty = require('../internals/create-non-enumerable-property');
var ERROR_STACK_INSTALLABLE = require('../internals/error-stack-installable');

var nativeStructuredClone = global.structuredClone;
var Object = global.Object;
var Date = global.Date;
var Error = global.Error;
var EvalError = global.EvalError;
var RangeError = global.RangeError;
var ReferenceError = global.ReferenceError;
var SyntaxError = global.SyntaxError;
var TypeError = global.TypeError;
var URIError = global.URIError;
var PerformanceMark = global.PerformanceMark;
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
var PERFORMANCE_MARK = uid('structuredClone');
var DATA_CLONE_ERROR = 'DataCloneError';

// waiting for https://github.com/zloirock/core-js/pull/991
var DOMException = function (message, name) {
  try {
    return new global.DOMException(message, name);
  } catch (error) {
    return TypeError(message);
  }
};

// Chrome 78+, Safari 14.1+
var structuredCloneFromMark = (function (structuredCloneFromMarkImpl) {
  return !fails(function () {
    var set = new global.Set([42]);
    var cloned = structuredCloneFromMarkImpl(set);
    return cloned === set || !cloned.has(42);
  }) && structuredCloneFromMarkImpl;
})(function (value) {
  return new PerformanceMark(PERFORMANCE_MARK, { detail: value }).detail;
});

// + FF94+
var nativeRestrictedStructuredClone = nativeStructuredClone || structuredCloneFromMark;

var USE_STRUCTURED_CLONE_FROM_MARK = !IS_PURE && !fails(function () {
  // Chrome 82- implementation swaps `.name` and `.message` of cloned `DOMException`
  var test = structuredCloneFromMark(new DOMException(PERFORMANCE_MARK, DATA_CLONE_ERROR));
  return test.name !== DATA_CLONE_ERROR || test.message !== PERFORMANCE_MARK
    // current Safari implementation can't clone errors
    || structuredCloneFromMark(Error(PERFORMANCE_MARK)).message !== PERFORMANCE_MARK;
});

var throwUncloneableType = function (type) {
  throw new DOMException('Uncloneable type: ' + type, DATA_CLONE_ERROR);
};

var structuredCloneInternal = function (value, map) {
  if (isSymbol(value)) throwUncloneableType('Symbol');
  if (!isObject(value)) return value;
  if (USE_STRUCTURED_CLONE_FROM_MARK) return structuredCloneFromMark(value);
  // effectively preserves circular references
  if (map) {
    if (mapHas(map, value)) return mapGet(map, value);
  } else map = new Map();

  var type = classof(value);
  var deep = false;
  var C, cloned, dataTransfer, i, length, key;

  switch (type) {
    case 'Array':
      cloned = [];
      deep = true;
      break;
    case 'Object':
      cloned = {};
      deep = true;
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
      deep = ERROR_STACK_INSTALLABLE;
      break;
    case 'DOMException':
      cloned = new DOMException(value.message, value.name);
      deep = ERROR_STACK_INSTALLABLE;
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
      C = global[type];
      if (!isConstructor(C)) throwUncloneableType(type);
      cloned = new C(
        // this is safe, since arraybuffer cannot have circular references
        structuredCloneInternal(value.buffer, map),
        value.byteOffset,
        type === 'DataView' ? value.byteLength : value.length
      );
      break;
    case 'DOMQuad':
      C = global.DOMQuad;
      if (isConstructor(C)) {
        cloned = new C(
          structuredCloneInternal(value.p1, map),
          structuredCloneInternal(value.p2, map),
          structuredCloneInternal(value.p3, map),
          structuredCloneInternal(value.p4, map)
        );
      } else if (nativeRestrictedStructuredClone) {
        cloned = nativeRestrictedStructuredClone(value);
      } else throwUncloneableType(type);
      break;
    case 'FileList':
      C = global.DataTransfer;
      if (isConstructor(C)) {
        dataTransfer = new C();
        for (i = 0, length = value.length; i < length; i++) {
          dataTransfer.items.add(structuredCloneInternal(value[i], map));
        }
        cloned = dataTransfer.files;
      } else if (nativeRestrictedStructuredClone) {
        cloned = nativeRestrictedStructuredClone(value);
      } else throwUncloneableType(type);
      break;
    case 'ImageData':
      C = global.ImageData;
      if (isConstructor(C)) {
        cloned = new C(
          structuredCloneInternal(value.data, map),
          value.width,
          value.height,
          { colorSpace: value.colorSpace }
        );
      } else if (nativeRestrictedStructuredClone) {
        cloned = nativeRestrictedStructuredClone(value);
      } else throwUncloneableType(type);
      break;
    default:
      if (nativeRestrictedStructuredClone) {
        cloned = nativeRestrictedStructuredClone(value);
      } else switch (type) {
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
          // detached buffers throws on `.slice`
          try {
            cloned = value.slice(0);
          } catch (error) {
            throw new DOMException('ArrayBuffer is deatched', DATA_CLONE_ERROR);
          } break;
        case 'SharedArrayBuffer':
          // SharedArrayBuffer should use shared memory, we can't polyfill it, so return the original
          cloned = value;
          break;
        case 'Blob':
          try {
            cloned = value.slice(0, value.size, value.type);
          } catch (error) {
            throwUncloneableType(type);
          } break;
        case 'DOMPoint':
        case 'DOMPointReadOnly':
          C = global[type];
          try {
            cloned = C.fromPoint ? C.fromPoint(value) : new C(value.x, value.y, value.z, value.w);
          } catch (error) {
            throwUncloneableType(type);
          } break;
        case 'DOMRect':
        case 'DOMRectReadOnly':
          C = global[type];
          try {
            cloned = C.fromRect ? C.fromRect(value) : new C(value.x, value.y, value.width, value.height);
          } catch (error) {
            throwUncloneableType(type);
          } break;
        case 'DOMMatrix':
        case 'DOMMatrixReadOnly':
          C = global[type];
          try {
            cloned = C.fromMatrix ? C.fromMatrix(value) : new C(value);
          } catch (error) {
            throwUncloneableType(type);
          } break;
        case 'AudioData':
        case 'VideoFrame':
          try {
            cloned = value.clone();
          } catch (error) {
            throwUncloneableType(type);
          } break;
        case 'File':
          try {
            cloned = new File([value], value.name, value);
          } catch (error) {
            throwUncloneableType(type);
          } break;
        default:
          throwUncloneableType(type);
      }
  }

  mapSet(map, value, cloned);

  if (deep) switch (type) {
    case 'Array':
    case 'Object':
      for (key in value) if (hasOwn(value, key)) {
        cloned[key] = structuredCloneInternal(value[key], map);
      } break;
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
      if (ERROR_STACK_INSTALLABLE) {
        createNonEnumerableProperty(cloned, 'stack', structuredCloneInternal(value.stack, map));
      } break;
  }

  return cloned;
};

var FORCED_REPLACEMENT = IS_PURE || fails(function () {
  // current FF implementation can't clone errors
  // https://bugzilla.mozilla.org/show_bug.cgi?id=1556604
  return nativeStructuredClone(Error('a')).message !== 'a';
});

$({ global: true, enumerable: true, sham: true, forced: FORCED_REPLACEMENT }, {
  structuredClone: function structuredClone(value /* , { transfer } */) {
    var options = arguments.length > 1 ? anObject(arguments[1]) : undefined;
    var transfer = options && options.transfer;

    if (transfer !== undefined) {
      if (!IS_PURE && nativeStructuredClone) return nativeStructuredClone(value, options);
      throw TypeError('Transfer option is not supported');
    }

    return structuredCloneInternal(value);
  }
});
