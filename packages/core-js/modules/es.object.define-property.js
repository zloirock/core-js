'use strict';
var $ = require('../internals/export');
var defineProperty = require('../internals/object-define-property').f;

// `Object.defineProperty` method
// https://tc39.es/ecma262/#sec-object.defineproperty
$({ target: 'Object', stat: true, forced: Object.defineProperty !== defineProperty }, {
  defineProperty: defineProperty,
});
