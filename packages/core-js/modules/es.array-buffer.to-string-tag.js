'use strict';
var setToStringTag = require('../internals/set-to-string-tag');

// ArrayBuffer.prototype[@@toStringTag] property
// https://tc39.es/ecma262/#sec-arraybuffer.prototype-@@tostringtag
setToStringTag(ArrayBuffer, 'ArrayBuffer');
