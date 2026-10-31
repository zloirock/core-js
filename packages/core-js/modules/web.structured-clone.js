// @types: web/structured-clone
'use strict';
var IS_PURE = require('../internals/is-pure');
var $ = require('../internals/export');
var globalThis = require('../internals/global-this');
var getBuiltIn = require('../internals/get-built-in');
var getBuiltInStaticMethod = require('../internals/get-built-in-static-method');
var uncurryThis = require('../internals/function-uncurry-this-clause');
var uncurryThisAccessor = require('../internals/function-uncurry-this-accessor');
var fails = require('../internals/fails');
var uid = require('../internals/uid');
var isCallable = require('../internals/is-callable');
var isConstructor = require('../internals/is-constructor');
var isNullOrUndefined = require('../internals/is-null-or-undefined');
var isObject = require('../internals/is-object');
var isSymbol = require('../internals/is-symbol');
var iterate = require('../internals/iterate');
var anObject = require('../internals/an-object');
var classof = require('../internals/classof');
var hasOwn = require('../internals/has-own-property');
var createProperty = require('../internals/create-property');
var createNonEnumerableProperty = require('../internals/create-non-enumerable-property');
var defineProperty = require('../internals/object-define-property').f;
var lengthOfArrayLike = require('../internals/length-of-array-like');
var validateArgumentsLength = require('../internals/validate-arguments-length');
var getRegExpFlags = require('../internals/regexp-get-flags');
var MapHelpers = require('../internals/map-helpers');
var SetHelpers = require('../internals/set-helpers');
var detachTransferable = require('../internals/detach-transferable');
var isDetached = require('../internals/array-buffer-is-detached');
var ENVIRONMENT = require('../internals/environment');
var ERROR_STACK_INSTALLABLE = require('../internals/error-stack-installable');
var PROPER_STRUCTURED_CLONE_TRANSFER = require('../internals/structured-clone-proper-transfer');

var $Object = Object;
var $Array = Array;
var $Date = Date;
var $Error = Error;
var $TypeError = TypeError;
var $ArrayBuffer = ArrayBuffer;
var $DataView = DataView;
var DataViewPrototype = $DataView.prototype;
var getUint8 = uncurryThis(DataViewPrototype.getUint8);
var setUint8 = uncurryThis(DataViewPrototype.setUint8);
var PerformanceMark = globalThis.PerformanceMark;
// @dependency: web.dom-exception.constructor
// @dependency: web.dom-exception.stack
// @dependency: web.dom-exception.to-string-tag
var DOMException = getBuiltIn('DOMException');
var Map = MapHelpers.Map;
var mapHas = MapHelpers.has;
var mapGet = MapHelpers.get;
var mapSet = MapHelpers.set;
var mapRemove = MapHelpers.remove;
var mapForEach = MapHelpers.forEach;
var Set = SetHelpers.Set;
var setAdd = SetHelpers.add;
var setHas = SetHelpers.has;
var setRemove = SetHelpers.remove;
var setForEach = SetHelpers.forEach;
var objectKeys = $Object.keys;
var push = uncurryThis([].push);
// eslint-disable-next-line es/no-arraybuffer-prototype-transfer -- safe
var arrayBufferTransfer = uncurryThis($ArrayBuffer.prototype.transfer);
// eslint-disable-next-line es/no-resizable-and-growable-arraybuffers -- safe
var arrayBufferResize = uncurryThis($ArrayBuffer.prototype.resize);
var dataViewByteLength = uncurryThisAccessor(DataViewPrototype, 'byteLength', 'get');
var thisBooleanValue = uncurryThis(true.valueOf);
var thisNumberValue = uncurryThis(1.1.valueOf);
var thisStringValue = uncurryThis(''.valueOf);
var thisTimeValue = uncurryThis($Date.prototype.getTime);
var PERFORMANCE_MARK = uid('structuredClone');
var DATA_CLONE_ERROR = 'DataCloneError';
var TRANSFERRING = 'Transferring';
var SHARED_OBJECTS = {};
// Native validation finishes before serialization reaches this getter, without transferring anything.
var transferCheck = PROPER_STRUCTURED_CLONE_TRANSFER && defineProperty({}, 'value', {
  enumerable: true,
  get: function () { throw transferCheck; },
});

var checkBasicSemantic = function (structuredCloneImplementation) {
  return !fails(function () {
    var set1 = new globalThis.Set([7]);
    var set2 = structuredCloneImplementation(set1);
    var number = structuredCloneImplementation($Object(7));
    return set2 === set1 || !set2.has(7) || !isObject(number) || +number !== 7;
  }) && structuredCloneImplementation;
};

var checkErrorsCloning = function (structuredCloneImplementation, $$Error) {
  return !fails(function () {
    var error = new $$Error();
    var test = structuredCloneImplementation({ a: error, b: error });
    return !(test && test.a === test.b && test.a instanceof $$Error && test.a.stack === error.stack);
  });
};

// https://github.com/whatwg/html/pull/5749
var checkNewErrorsCloningSemantic = function (structuredCloneImplementation) {
  return !fails(function () {
    // eslint-disable-next-line es/no-error-cause, es/no-promise-any -- testing
    var test = structuredCloneImplementation(new AggregateError([1], PERFORMANCE_MARK, { cause: 3 }));
    return test.name !== 'AggregateError' || test.errors[0] !== 1 || test.message !== PERFORMANCE_MARK || test.cause !== 3;
  });
};

// FF94+, Safari 15.4+, Chrome 98+, NodeJS 17.0+, Deno 1.13+
// FF<103 and Safari implementations can't clone errors
// https://bugzilla.mozilla.org/show_bug.cgi?id=1556604
// FF103 can clone errors, but `.stack` of clone is an empty string
// https://bugzilla.mozilla.org/show_bug.cgi?id=1778762
// FF104+ fixed it on usual errors, but not on DOMExceptions
// https://bugzilla.mozilla.org/show_bug.cgi?id=1777321
// Chrome <102 returns `null` if cloned object contains multiple references to one error
// https://issues.chromium.org/issues/42202488
// NodeJS implementation can't clone DOMExceptions
// https://github.com/nodejs/node/issues/41038
// only FF103+ supports new (html/5749) error cloning semantic
var nativeStructuredClone = globalThis.structuredClone;
var nativeRestrictedStructuredClone = checkBasicSemantic(nativeStructuredClone);
// modern engines trust any `structuredClone` with transfers, but not one that fails basic cloning
var PROPER_TRANSFER = PROPER_STRUCTURED_CLONE_TRANSFER && !!nativeRestrictedStructuredClone;
// Deno 1.13 can transfer MessagePorts even though ArrayBuffer transfer is unavailable.
var NATIVE_TRANSFER = PROPER_TRANSFER || ENVIRONMENT === 'DENO' && !!nativeRestrictedStructuredClone;
// Native preflight relies on transfer-list validation preceding serialization.
// Deno validates non-buffer entries after serialization, so the sentinel getter
// hides invalid entries; newer Deno also detaches ArrayBuffers before the getter.
// Deno 1.13 additionally wraps getter exceptions in DataCloneError, losing the sentinel.
// Probe with a harmless invalid entry and record getter access without throwing.
// If serialization starts, skip native preflight and use the type checks below.
var PROPER_TRANSFER_VALIDATION = PROPER_TRANSFER && !fails(function () {
  var serialized = false;
  var value = defineProperty({}, 'value', { enumerable: true, get: function () { serialized = true; } });
  try {
    nativeStructuredClone(value, { transfer: [{}] });
  } catch (error) { /* empty */ }
  return serialized;
});

var FORCED_REPLACEMENT = IS_PURE
  || !nativeRestrictedStructuredClone
  || !checkErrorsCloning(nativeStructuredClone, $Error)
  || !checkErrorsCloning(nativeStructuredClone, DOMException)
  || !checkNewErrorsCloningSemantic(nativeStructuredClone);

// Chrome 82+, Safari 14.1+, Deno 1.11+
// Chrome 78-81 implementation swaps `.name` and `.message` of cloned `DOMException`
// Chrome returns `null` if cloned object contains multiple references to one error
// Safari 14.1 implementation doesn't clone some `RegExp` flags, so requires a workaround
// Safari implementation can't clone errors
// Deno 1.2-1.10 implementations too naive
// NodeJS 16.0+ does not have `PerformanceMark` constructor
// NodeJS <17.2 structured cloning implementation from `performance.mark` is too naive
// and can't clone, for example, `RegExp` or some boxed primitives
// https://github.com/nodejs/node/issues/40840
// no one of those implementations supports new (html/5749) error cloning semantic
var structuredCloneFromMark = !nativeStructuredClone && checkBasicSemantic(function (value) {
  return new PerformanceMark(PERFORMANCE_MARK, { detail: value }).detail;
});

nativeRestrictedStructuredClone = nativeRestrictedStructuredClone || structuredCloneFromMark;

var throwUncloneable = function (type) {
  throw new DOMException('Uncloneable type: ' + type, DATA_CLONE_ERROR);
};

var throwUnpolyfillable = function (type, action) {
  throw new DOMException((action || 'Cloning') + ' of ' + type + ' cannot be properly polyfilled in this engine', DATA_CLONE_ERROR);
};

var tryNativeRestrictedStructuredClone = function (value, type) {
  if (!nativeRestrictedStructuredClone) throwUnpolyfillable(type);
  return nativeRestrictedStructuredClone(value);
};

var createDataTransfer = function () {
  var dataTransfer;
  try {
    dataTransfer = new globalThis.DataTransfer();
  } catch (error) {
    try {
      dataTransfer = new globalThis.ClipboardEvent('').clipboardData;
    } catch (error2) { /* empty */ }
  }
  return dataTransfer && dataTransfer.items && dataTransfer.files ? dataTransfer : null;
};

var cloneBuffer = function (value, map, $type) {
  if (mapHas(map, value)) return mapGet(map, value);

  var type = $type || classof(value);
  var clone, length, options, source, target, i;

  if (type === 'SharedArrayBuffer') {
    if (nativeRestrictedStructuredClone) clone = nativeRestrictedStructuredClone(value);
    // SharedArrayBuffer should use shared memory, we can't polyfill it, so return the original
    if (!clone || classof(clone) !== 'SharedArrayBuffer') clone = value;
  } else {
    // detached buffers throw in `DataView` and `.slice`, but not in every engine
    if (isDetached(value)) throw new DOMException('ArrayBuffer is detached', DATA_CLONE_ERROR);
    if (isCallable(value.slice) && !value.resizable) {
      clone = value.slice(0);
    } else {
      length = value.byteLength;
      options = 'maxByteLength' in value ? { maxByteLength: value.maxByteLength } : undefined;
      // eslint-disable-next-line es/no-resizable-and-growable-arraybuffers -- safe
      clone = new $ArrayBuffer(length, options);
      source = new $DataView(value);
      target = new $DataView(clone);
      for (i = 0; i < length; i++) {
        setUint8(target, i, getUint8(source, i));
      }
    }
  }

  mapSet(map, value, clone);

  return clone;
};

var cloneView = function (value, type, map) {
  var C = globalThis[type];
  // in some old engines like Safari 9, typeof C is 'object'
  // on Uint8ClampedArray or some other constructors
  if (!isObject(C)) throwUnpolyfillable(type);
  var buffer = value.buffer;
  // Old WebKit can return null for the buffer of a detached view.
  // Validate the view even if its buffer has already been cloned.
  if (!buffer || isDetached(buffer)) throw new DOMException('ArrayBuffer is detached', DATA_CLONE_ERROR);
  var isDataView = type === 'DataView';
  var isGrowable = buffer.growable;
  var offset, length, cloned, clonedBuffer, byteLength, shared, sharedClone;

  if (nativeRestrictedStructuredClone && (buffer.resizable || isGrowable)) {
    // native cloning validates the view and preserves its length-tracking mode
    cloned = nativeRestrictedStructuredClone(value);
    // older WebKit clones shared buffers as non-shared buffers
    sharedClone = isGrowable && cloned.buffer.growable;
    if (sharedClone) {
      shared = mapGet(map, SHARED_OBJECTS);
      if (!shared) mapSet(map, SHARED_OBJECTS, shared = []);
      push(shared, value);
      push(shared, buffer);
    }
    if ((!isGrowable || sharedClone) && !mapHas(map, buffer)) {
      mapSet(map, buffer, cloned.buffer);
      return cloned;
    }
    if (sharedClone) return cloned;
    offset = cloned.byteOffset;
    length = isDataView ? cloned.byteLength : cloned.length;
    clonedBuffer = cloned.buffer;
    // probe a temporary copy, never the source or the buffer shared by cloned views
    // nonempty fixed views become out of bounds; empty tracking views grow by one element
    // a copy that cannot be resized hides the mode, like without native cloning the view becomes fixed-length
    byteLength = offset + (length ? 0 : C.BYTES_PER_ELEMENT || 1);
    if (clonedBuffer.resizable && byteLength <= clonedBuffer.maxByteLength) {
      arrayBufferResize(clonedBuffer, byteLength);
      if (!fails(function () {
        // polyfilled typed array methods may accept out-of-bounds views
        if (!isDataView) nativeRestrictedStructuredClone(cloned);
        return cloned.byteLength === 0 && length === 0;
      })) length = undefined;
    }
  } else {
    // like native cloning, reject out-of-bounds views: the probe above relies on it when pure core-js uses this polyfill
    // out-of-bounds data views throw on native accessors, out-of-bounds typed arrays - on copying
    if (buffer.resizable && fails(function () {
      if (isDataView) dataViewByteLength(value);
      // eslint-disable-next-line no-new -- thrower
      else new C(value);
    })) throw new DOMException(type + ' is out of bounds', DATA_CLONE_ERROR);
    // without native cloning, length-tracking views are cloned as fixed-length views
    offset = value.byteOffset;
    length = isDataView ? value.byteLength : value.length;
  }

  return new C(cloneBuffer(buffer, map), offset, length);
};

var structuredCloneInternal = function (value, map) {
  if (isSymbol(value)) throwUncloneable('Symbol');
  if (!isObject(value)) return value;
  // effectively preserves circular references
  if (mapHas(map, value)) return mapGet(map, value);

  var type = classof(value);
  var C, name, cloned, dataTransfer, i, length, keys, key, entries;

  switch (type) {
    case 'WeakMap':
    case 'WeakSet':
    case 'MessagePort':
      throwUncloneable(type);
      break;
    case 'Array':
      cloned = $Array(lengthOfArrayLike(value));
      break;
    case 'Object':
      cloned = {};
      break;
    case 'Map':
      cloned = new Map();
      break;
    case 'Set':
      cloned = new Set();
      break;
    case 'RegExp':
      // in this block because of a Safari 14.1 bug
      // old FF does not clone regexes passed to the constructor, so get the source and flags directly
      cloned = new RegExp(value.source, getRegExpFlags(value));
      break;
    case 'Error':
      name = value.name;
      switch (name) {
        case 'AggregateError':
          cloned = new (getBuiltIn(name))([]);
          break;
        case 'EvalError':
        case 'RangeError':
        case 'ReferenceError':
        case 'SuppressedError':
        case 'SyntaxError':
        case 'TypeError':
        case 'URIError':
          cloned = new (getBuiltIn(name))();
          break;
        case 'CompileError':
        case 'LinkError':
        case 'RuntimeError':
          cloned = new (getBuiltInStaticMethod('WebAssembly', name))();
          break;
        default:
          cloned = new $Error();
      }
      break;
    case 'DOMException':
      cloned = new DOMException(value.message, value.name);
      break;
    case 'ArrayBuffer':
    case 'SharedArrayBuffer':
      cloned = cloneBuffer(value, map, type);
      break;
    case 'DataView':
    case 'Int8Array':
    case 'Uint8Array':
    case 'Uint8ClampedArray':
    case 'Int16Array':
    case 'Uint16Array':
    case 'Int32Array':
    case 'Uint32Array':
    case 'Float16Array':
    case 'Float32Array':
    case 'Float64Array':
    case 'BigInt64Array':
    case 'BigUint64Array':
      cloned = cloneView(value, type, map);
      break;
    case 'DOMQuad':
      try {
        cloned = new DOMQuad(
          structuredCloneInternal(value.p1, map),
          structuredCloneInternal(value.p2, map),
          structuredCloneInternal(value.p3, map),
          structuredCloneInternal(value.p4, map)
        );
      } catch (error) {
        cloned = tryNativeRestrictedStructuredClone(value, type);
      }
      break;
    case 'File':
      if (nativeRestrictedStructuredClone) try {
        cloned = nativeRestrictedStructuredClone(value);
        // NodeJS 20.0.0 bug, https://github.com/nodejs/node/issues/47612
        if (classof(cloned) !== type) cloned = undefined;
      } catch (error) { /* empty */ }
      if (!cloned) try {
        cloned = new File([value], value.name, value);
      } catch (error) { /* empty */ }
      if (!cloned) throwUnpolyfillable(type);
      break;
    case 'FileList':
      dataTransfer = createDataTransfer();
      if (dataTransfer) {
        for (i = 0, length = lengthOfArrayLike(value); i < length; i++) {
          dataTransfer.items.add(structuredCloneInternal(value[i], map));
        }
        cloned = dataTransfer.files;
      } else cloned = tryNativeRestrictedStructuredClone(value, type);
      break;
    case 'ImageData':
      // Safari 9 ImageData is a constructor, but typeof ImageData is 'object'
      try {
        cloned = new ImageData(
          structuredCloneInternal(value.data, map),
          value.width,
          value.height,
          { colorSpace: value.colorSpace }
        );
      } catch (error) {
        cloned = tryNativeRestrictedStructuredClone(value, type);
      } break;
    default:
      if (nativeRestrictedStructuredClone) {
        cloned = nativeRestrictedStructuredClone(value);
      } else switch (type) {
        case 'BigInt':
          // can be a 3rd party polyfill
          cloned = $Object(value.valueOf());
          break;
        case 'Boolean':
          cloned = $Object(thisBooleanValue(value));
          break;
        case 'Number':
          cloned = $Object(thisNumberValue(value));
          break;
        case 'String':
          cloned = $Object(thisStringValue(value));
          break;
        case 'Date':
          cloned = new $Date(thisTimeValue(value));
          break;
        case 'Blob':
          try {
            cloned = value.slice(0, value.size, value.type);
          } catch (error) {
            throwUnpolyfillable(type);
          } break;
        case 'DOMPoint':
        case 'DOMPointReadOnly':
          C = globalThis[type];
          try {
            cloned = C.fromPoint
              ? C.fromPoint(value)
              : new C(value.x, value.y, value.z, value.w);
          } catch (error) {
            throwUnpolyfillable(type);
          } break;
        case 'DOMRect':
        case 'DOMRectReadOnly':
          C = globalThis[type];
          try {
            cloned = C.fromRect
              ? C.fromRect(value)
              : new C(value.x, value.y, value.width, value.height);
          } catch (error) {
            throwUnpolyfillable(type);
          } break;
        case 'DOMMatrix':
        case 'DOMMatrixReadOnly':
          C = globalThis[type];
          try {
            cloned = C.fromMatrix
              ? C.fromMatrix(value)
              : new C(value);
          } catch (error) {
            throwUnpolyfillable(type);
          } break;
        case 'AudioData':
        case 'VideoFrame':
          if (!isCallable(value.clone)) throwUnpolyfillable(type);
          try {
            cloned = value.clone();
          } catch (error) {
            throwUncloneable(type);
          } break;
        case 'CropTarget':
        case 'CryptoKey':
        case 'FileSystemDirectoryHandle':
        case 'FileSystemFileHandle':
        case 'FileSystemHandle':
        case 'GPUCompilationInfo':
        case 'GPUCompilationMessage':
        case 'ImageBitmap':
        case 'RTCCertificate':
        case 'WebAssembly.Module':
          throwUnpolyfillable(type);
          // break omitted
        default:
          throwUncloneable(type);
      }
  }

  mapSet(map, value, cloned);

  switch (type) {
    case 'Array':
    case 'Object':
      keys = objectKeys(value);
      for (i = 0, length = lengthOfArrayLike(keys); i < length; i++) {
        key = keys[i];
        if (hasOwn(value, key)) createProperty(cloned, key, structuredCloneInternal(value[key], map));
      } break;
    case 'Map':
      entries = [];
      value.forEach(function (v, k) {
        push(entries, [k, v]);
      });
      for (i = 0; i < entries.length; i++) {
        mapSet(cloned, structuredCloneInternal(entries[i][0], map), structuredCloneInternal(entries[i][1], map));
      } break;
    case 'Set':
      entries = [];
      value.forEach(function (v) {
        push(entries, v);
      });
      for (i = 0; i < entries.length; i++) {
        setAdd(cloned, structuredCloneInternal(entries[i], map));
      } break;
    case 'Error':
      // in old FF, an own property check is needed to resolve a lazy Error#message
      hasOwn(value, 'message');
      createNonEnumerableProperty(cloned, 'message', structuredCloneInternal(value.message, map));
      if (hasOwn(value, 'cause')) {
        createNonEnumerableProperty(cloned, 'cause', structuredCloneInternal(value.cause, map));
      }
      if (name === 'AggregateError') {
        cloned.errors = structuredCloneInternal(value.errors, map);
      } else if (name === 'SuppressedError') {
        cloned.error = structuredCloneInternal(value.error, map);
        cloned.suppressed = structuredCloneInternal(value.suppressed, map);
      } // break omitted
    case 'DOMException':
      if (ERROR_STACK_INSTALLABLE) {
        createNonEnumerableProperty(cloned, 'stack', structuredCloneInternal(value.stack, map));
      }
  }

  return cloned;
};

// only references in our completed clones are updated; source getters are not revisited
var replaceReferences = function (map, replacements, clone) {
  var replace = function (value) {
    return mapHas(replacements, value) ? mapGet(replacements, value) : value;
  };
  mapForEach(map, function (cloned, original) {
    if (original === SHARED_OBJECTS) return;
    var type = classof(cloned);
    var entries, keys, key, value, j;
    if (type === 'Map') {
      entries = [];
      mapForEach(cloned, function (v, k) {
        push(entries, [replace(k), replace(v)]);
        mapRemove(cloned, k);
      });
      for (j = 0; j < entries.length; j++) mapSet(cloned, entries[j][0], entries[j][1]);
    } else if (type === 'Set') {
      entries = [];
      setForEach(cloned, function (v) {
        push(entries, replace(v));
        setRemove(cloned, v);
      });
      for (j = 0; j < entries.length; j++) setAdd(cloned, entries[j]);
    } else {
      if (type === 'Array' || type === 'Object') keys = objectKeys(cloned);
      else if (type === 'Error' || type === 'DOMException') keys = ['message', 'cause', 'errors', 'error', 'suppressed', 'stack'];
      if (keys) for (j = 0; j < keys.length; j++) {
        key = keys[j];
        if (hasOwn(cloned, key)) {
          value = cloned[key];
          if (mapHas(replacements, value)) cloned[key] = mapGet(replacements, value);
        }
      }
    }
  });
  return replace(clone);
};

// shared memory has no byte snapshot to take before visiting later properties
var resolveSharedClones = function (map, replacements) {
  var shared = mapGet(map, SHARED_OBJECTS);
  var copies = nativeRestrictedStructuredClone(shared);
  for (var i = 0; i < copies.length; i++) mapSet(replacements, mapGet(map, shared[i]), copies[i]);
};

var prepareTransfer = function (rawTransfer, map) {
  if (!isObject(rawTransfer)) throw new $TypeError('Transfer option cannot be converted to a sequence');

  var transfer = [];

  // @dependency: es.array.iterator
  iterate(rawTransfer, function (value) {
    push(transfer, anObject(value));
  });

  var i = 0;
  var length = lengthOfArrayLike(transfer);
  var buffers = new Set();
  var nativeTransfer = [];
  var hasObjects = false;
  var value, type, isMedia;

  while (i < length) {
    value = transfer[i++];
    type = classof(value);

    if (type === 'ArrayBuffer' ? setHas(buffers, value) : mapHas(map, value)) {
      throw new DOMException('Duplicate transferable', DATA_CLONE_ERROR);
    }

    if (type === 'ArrayBuffer') {
      if (!detachTransferable && !arrayBufferTransfer) throwUnpolyfillable(type, TRANSFERRING);
      setAdd(buffers, value);
      if (PROPER_TRANSFER_VALIDATION) push(nativeTransfer, value);
      continue;
    }

    // Native buffer transfer does not imply support for AudioData / VideoFrame transfer.
    isMedia = type === 'AudioData' || type === 'VideoFrame';
    // Deno validates transferables after serialization; WebKit does so for shared buffers.
    if (isMedia || !PROPER_TRANSFER_VALIDATION || type === 'SharedArrayBuffer') switch (type) {
      case 'ImageBitmap':
        if (NATIVE_TRANSFER) break;
        if (!isConstructor(globalThis.OffscreenCanvas)) throwUnpolyfillable(type, TRANSFERRING);
        break;
      case 'AudioData':
      case 'VideoFrame':
        if (!isCallable(value.clone) || !isCallable(value.close)) throwUnpolyfillable(type, TRANSFERRING);
        break;
      case 'MediaSourceHandle':
      case 'MessagePort':
      case 'MIDIAccess':
      case 'OffscreenCanvas':
      case 'ReadableStream':
      case 'RTCDataChannel':
      case 'TransformStream':
      case 'WebTransportReceiveStream':
      case 'WebTransportSendStream':
      case 'WritableStream':
        if (NATIVE_TRANSFER) break;
        throwUnpolyfillable(type, TRANSFERRING);
        // break omitted
      default:
        throw new DOMException('This object cannot be transferred: ' + type, DATA_CLONE_ERROR);
    }

    if (PROPER_TRANSFER_VALIDATION && !isMedia) push(nativeTransfer, value);
    hasObjects = true;
    mapSet(map, value, { type: type });
  }

  if (PROPER_TRANSFER_VALIDATION && hasObjects) {
    try {
      nativeStructuredClone(transferCheck, { transfer: nativeTransfer });
    } catch (error) {
      if (error !== transferCheck) throw error;
    }
  }

  return { list: transfer, buffers: buffers, hasObjects: hasObjects };
};

// Keep the transfer-list order, including buffers, if a later transfer fails.
var performTransfer = function (transfer, map, replacements) {
  var list = transfer.list;
  var value, placeholder, type, transferred, C, canvas, context;
  for (var i = 0; i < list.length; i++) {
    value = list[i];
    if (setHas(transfer.buffers, value)) {
      detachBuffer(value);
      continue;
    }
    placeholder = mapGet(map, value);
    type = placeholder.type;
    transferred = undefined;
    if (NATIVE_TRANSFER && type !== 'AudioData' && type !== 'VideoFrame') {
      transferred = nativeStructuredClone(value, { transfer: [value] });
    } else {
      switch (type) {
        case 'ImageBitmap':
          C = globalThis.OffscreenCanvas;
          try {
            canvas = new C(value.width, value.height);
            context = canvas.getContext('bitmaprenderer');
            context.transferFromImageBitmap(value);
            transferred = canvas.transferToImageBitmap();
          } catch (error) { /* empty */ }
          break;
        case 'AudioData':
        case 'VideoFrame':
          try {
            transferred = value.clone();
            value.close();
          } catch (error) { /* empty */ }
      }
    }
    if (transferred === undefined) throw new DOMException('This object cannot be transferred: ' + type, DATA_CLONE_ERROR);
    mapSet(replacements, placeholder, transferred);
  }
};

var detachBuffer = function (buffer) {
  if (isDetached(buffer)) throw new DOMException('ArrayBuffer is detached', DATA_CLONE_ERROR);
  if (detachTransferable) {
    detachTransferable(buffer);
  } else if (arrayBufferTransfer) {
    arrayBufferTransfer(buffer);
  } else {
    throwUnpolyfillable('ArrayBuffer', TRANSFERRING);
  }
  if (!isDetached(buffer)) throw new DOMException('ArrayBuffer is not detachable', DATA_CLONE_ERROR);
};

// `structuredClone` method
// https://html.spec.whatwg.org/multipage/structured-data.html#dom-structuredclone
$({ global: true, enumerable: true, sham: !PROPER_TRANSFER, forced: FORCED_REPLACEMENT }, {
  structuredClone: function structuredClone(value /* , { transfer } */) {
    var options = validateArgumentsLength(arguments.length, 1) > 1 && !isNullOrUndefined(arguments[1]) ? anObject(arguments[1]) : undefined;
    var transfer = options ? options.transfer : undefined;
    var map = isObject(value) ? new Map() : undefined;
    var transfers, replacements;

    if (transfer !== undefined) {
      if (!map) map = new Map();
      transfers = prepareTransfer(transfer, map);
    }

    var clone = structuredCloneInternal(value, map);
    if (map && mapHas(map, SHARED_OBJECTS)) {
      replacements = new Map();
      resolveSharedClones(map, replacements);
    }

    // Transfer after cloning so views of transferred buffers can be cloned.
    // https://github.com/zloirock/core-js/issues/1265
    if (transfers) {
      if (transfers.hasObjects && !replacements) replacements = new Map();
      performTransfer(transfers, map, replacements);
    }

    return replacements ? replaceReferences(map, replacements, clone) : clone;
  },
});
