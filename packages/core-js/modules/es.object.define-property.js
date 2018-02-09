// `Object.defineProperty` method
// https://tc39.github.io/ecma262/#sec-object.defineproperty
require('./_export')({ target: 'Object', stat: true, forced: !require('core-js-internals/descriptors') }, {
  defineProperty: require('./_object-define-property').f
});
