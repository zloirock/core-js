// `Object.defineProperties` method
// https://tc39.github.io/ecma262/#sec-object.defineproperties
require('../internals/export')({ target: 'Object', stat: true, forced: !require('../internals/descriptors') }, {
  defineProperties: require('../internals/object-define-properties')
});
