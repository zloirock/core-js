'use strict';
var $ = require('../internals/export');
var getBuiltInStaticMethod = require('../internals/get-built-in-static-method');
var anObject = require('../internals/an-object');

// `Reflect.preventExtensions` method
// https://tc39.es/ecma262/#sec-reflect.preventextensions
$({ target: 'Reflect', stat: true }, {
  preventExtensions: function preventExtensions(target) {
    anObject(target);
    try {
      getBuiltInStaticMethod('Object', 'preventExtensions')(target);
      return true;
    } catch (error) {
      return false;
    }
  },
});
