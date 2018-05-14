'use strict';
var Uint8Array = require('../internals/global').Uint8Array;
var Uint8ArrayPrototype = Uint8Array && Uint8Array.prototype;
var ArrayBufferViewCore = require('../internals/array-buffer-view-core');
var arrayToString = [].toString;
var arrayJoin = [].join;

if (require('../internals/fails')(function () { arrayToString.call({}); })) {
  arrayToString = function toString() {
    return arrayJoin.call(this);
  };
}

// `%TypedArray%.prototype.toString` method
// https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.tostring
ArrayBufferViewCore.exportProto('toString', arrayToString, (Uint8ArrayPrototype || {}).toString != arrayToString);
