var defineProperty = require('../internals/object-define-property').f;
var FunctionPrototype = Function.prototype;
var nameRE = /^\s*function ([^ (]*)/;
var NAME = 'name';

// Function instances `.name` property
// https://tc39.github.io/ecma262/#sec-function-instances-name
NAME in FunctionPrototype || require('../internals/descriptors') && defineProperty(FunctionPrototype, NAME, {
  configurable: true,
  get: function () {
    try {
      return ('' + this).match(nameRE)[1];
    } catch (e) {
      return '';
    }
  }
});
