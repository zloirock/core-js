'use strict';
var path = require('../internals/path');
var setToStringTag = require('../internals/set-to-string-tag');

// JSON[@@toStringTag] property
// https://tc39.es/ecma262/#sec-json-@@tostringtag
setToStringTag(path.JSON, 'JSON', true);
