'use strict';
var FUNCTION_NAME = require('../internals/function-name');
var defineBuiltInAccessor = require('../internals/define-built-in-accessor');
var getName = require('../internals/function-get-name');

// Function instances `.name` property
// https://tc39.es/ecma262/#sec-function-instances-name
if (!FUNCTION_NAME.EXISTS) {
  defineBuiltInAccessor(Function.prototype, 'name', {
    configurable: true,
    get: function () {
      return getName(this);
    },
  });
}
