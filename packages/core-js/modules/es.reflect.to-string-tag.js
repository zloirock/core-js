'use strict';
var path = require('../internals/path');
var setToStringTag = require('../internals/set-to-string-tag');

// Reflect[@@toStringTag] property
// https://tc39.es/ecma262/#sec-reflect-%symbol.tostringtag%
// @dependency: es.reflect.namespace
setToStringTag(path.Reflect, 'Reflect', true);
