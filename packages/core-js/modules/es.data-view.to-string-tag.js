'use strict';
var setToStringTag = require('../internals/set-to-string-tag');

// DataView.prototype[@@toStringTag] property
// https://tc39.es/ecma262/#sec-dataview.prototype-@@tostringtag
setToStringTag(DataView, 'DataView');
