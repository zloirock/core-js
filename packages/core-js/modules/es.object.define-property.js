var DESCRIPTORS = require('../internals/descriptors');

// `Object.defineProperty` method
// https://tc39.github.io/ecma262/#sec-object.defineproperty
require('../internals/export')({ target: 'Object', stat: true, forced: !DESCRIPTORS, sham: !DESCRIPTORS }, {
  defineProperty: require('../internals/object-define-property').f
});
