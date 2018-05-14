var DESCRIPTORS = require('../internals/descriptors');

// `Object.defineProperties` method
// https://tc39.github.io/ecma262/#sec-object.defineproperties
require('../internals/export')({ target: 'Object', stat: true, forced: !DESCRIPTORS, sham: !DESCRIPTORS }, {
  defineProperties: require('../internals/object-define-properties')
});
