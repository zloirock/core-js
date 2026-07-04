'use strict';
var $ = require('../internals/export');
var path = require('../internals/path');
var setToStringTag = require('../internals/set-to-string-tag');

$({ global: true, namespace: true }, { JSON: {} });

// JSON[@@toStringTag] property
// https://tc39.es/ecma262/#sec-json-@@tostringtag
setToStringTag(path.JSON, 'JSON', true);
