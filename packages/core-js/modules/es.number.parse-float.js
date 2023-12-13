'use strict';
var $ = require('../internals/export');
var getBuiltIn = require('../internals/get-built-in');

// dependency: es.parse-float
var parseFloat = getBuiltIn('parseFloat');

// `Number.parseFloat` method
// https://tc39.es/ecma262/#sec-number.parseFloat
// eslint-disable-next-line es/no-number-parsefloat -- required for testing
$({ target: 'Number', stat: true, forced: Number.parseFloat !== parseFloat }, {
  parseFloat: parseFloat,
});
