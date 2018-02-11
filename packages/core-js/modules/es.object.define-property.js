// `Object.defineProperty` method
// https://tc39.github.io/ecma262/#sec-object.defineproperty
require('../internals/export')({ target: 'Object', stat: true, forced: !require('core-js-internals/descriptors') }, {
  defineProperty: require('../internals/object-define-property').f
});
