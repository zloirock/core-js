'use strict';
var $ = require('../internals/export');
var path = require('../internals/path');
var setToStringTag = require('../internals/set-to-string-tag');

$({ global: true, namespace: true }, { Math: {} });

// Math[@@toStringTag] property
// https://tc39.es/ecma262/#sec-math-@@tostringtag
setToStringTag(path.Math, 'Math', true);
