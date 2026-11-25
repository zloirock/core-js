'use strict';
var $ = require('../internals/export');
var globalThis = require('../internals/global-this');
var $fromBase64 = require('../internals/uint8-from-base64');
var anUint8Array = require('../internals/an-uint8-array');

var Uint8Array = globalThis.Uint8Array;

var INCORRECT_BEHAVIOR_OR_DOESNT_EXISTS = !Uint8Array || !Uint8Array.prototype.setFromBase64 || !function () {
  // https://issues.chromium.org/issues/454630441
  // https://github.com/simdutf/simdutf/pull/825
  try {
    // eslint-disable-next-line es/no-resizable-and-growable-arraybuffers -- required for testing
    var rab = new ArrayBuffer(4, { maxByteLength: 8 });
    var view = new Uint8Array(rab);
    var result = view.setFromBase64('Zm9v\n');
    if (result.read !== 5 || result.written !== 3) return;
    // V8 and JavaScriptCore read past the last chunk that fits.
    // https://github.com/tc39/test262/pull/4605
    // https://groups.google.com/g/v8-dev/c/sMEwyJ9GtY0
    // https://github.com/WebKit/WebKit/blob/52cfc989e4a5cf1cc63da6d72b65d16946f821f5/JSTests/test262/expectations.yaml#L55-L57
    var full = new Uint8Array(3);
    if (full.setFromBase64('Zm9v\n').read !== 4 || full.setFromBase64('Zm9v#').read !== 4) return;
    if (view.setFromBase64('Zm9vAAA', { lastChunkHandling: 'strict' }).read !== 4) return;
  } catch (error) {
    return;
  }
  var target = new Uint8Array([255, 255, 255, 255, 255]);
  try {
    target.setFromBase64('', null);
    return;
  } catch (error) { /* empty */ }
  // Webkit not throw an error on odd length string
  try {
    target.setFromBase64('a');
    return;
  } catch (error) { /* empty */ }
  try {
    target.setFromBase64('MjYyZg===');
  } catch (error) {
    return target[0] === 50 && target[1] === 54 && target[2] === 50 && target[3] === 255 && target[4] === 255;
  }
}();

// `Uint8Array.prototype.setFromBase64` method
// https://tc39.es/ecma262/#sec-uint8array.prototype.setfrombase64
if (Uint8Array) $({ target: 'Uint8Array', proto: true, forced: INCORRECT_BEHAVIOR_OR_DOESNT_EXISTS }, {
  setFromBase64: function setFromBase64(string /* , options */) {
    anUint8Array(this);

    var result = $fromBase64(string, arguments.length > 1 ? arguments[1] : undefined, this);

    return { read: result.read, written: result.written };
  }
});
