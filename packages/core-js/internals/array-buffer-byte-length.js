'use strict';
var globalThis = require('../internals/global-this');
var getNativePrototype = require('../internals/array-buffer-native-prototype');
var getOwnPropertyDescriptor = require('../internals/object-get-own-property-descriptor').f;
var uncurryThisAccessor = require('../internals/function-uncurry-this-accessor');
var getInternalState = require('../internals/internal-state').get;
var classof = require('../internals/classof-raw');

var ArrayBuffer = globalThis.ArrayBuffer;
var TypeError = globalThis.TypeError;
var POLYFILLED_ARRAY_BUFFER = !ArrayBuffer || getInternalState(new ArrayBuffer(0)).type === 'ArrayBuffer';
var byteLength = !POLYFILLED_ARRAY_BUFFER && uncurryThisAccessor(ArrayBuffer.prototype, 'byteLength', 'get');

// Includes
// - Perform ? RequireInternalSlot(O, [[ArrayBufferData]]).
// - If IsSharedArrayBuffer(O) is true, throw a TypeError exception.
module.exports = function (O) {
  // native buffers can outlive a full constructor replacement
  var state = getInternalState(O);
  if (state.type === 'ArrayBuffer') return state.byteLength;
  if (byteLength) return byteLength(O);
  var prototype = POLYFILLED_ARRAY_BUFFER && getNativePrototype(O);
  var getByteLength = prototype && uncurryThisAccessor(prototype, 'byteLength', 'get');
  if (getByteLength) return getByteLength(O);
  if (classof(O) !== 'ArrayBuffer') throw new TypeError('ArrayBuffer expected');
  if (POLYFILLED_ARRAY_BUFFER) {
    // IE10-11 and old Firefox expose byteLength as a non-configurable own data property.
    var descriptor = getOwnPropertyDescriptor(O, 'byteLength');
    if (!descriptor || descriptor.configurable || !('value' in descriptor)) throw new TypeError('ArrayBuffer expected');
    return descriptor.value;
  }
  return O.byteLength;
};
