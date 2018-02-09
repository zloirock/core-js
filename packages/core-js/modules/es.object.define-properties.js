// `Object.defineProperties` method
// https://tc39.github.io/ecma262/#sec-object.defineproperties
require('./_export')({ target: 'Object', stat: true, forced: !require('core-js-internals/descriptors') }, {
  defineProperties: require('./_object-define-properties')
});
