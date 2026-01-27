'use strict';
var $ = require('../internals/export');
var getBuiltIn = require('../internals/get-built-in');

// @dependency: es.parse-int
var parseInt = getBuiltIn('parseInt');

// `Number.parseInt` method
// https://tc39.es/ecma262/#sec-number.parseint
// eslint-disable-next-line es/no-number-parseint -- required for testing
$({ target: 'Number', stat: true, forced: Number.parseInt !== parseInt }, {
  parseInt: parseInt,
});
