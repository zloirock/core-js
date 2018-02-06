var defineProperty = require('./_object-define-property').f;
var FunctionPrototype = Function.prototype;
var nameRE = /^\s*function ([^ (]*)/;
var NAME = 'name';

// 19.2.4.2 name
NAME in FunctionPrototype || require('core-js-internals/descriptors') && defineProperty(FunctionPrototype, NAME, {
  configurable: true,
  get: function () {
    try {
      return ('' + this).match(nameRE)[1];
    } catch (e) {
      return '';
    }
  }
});
