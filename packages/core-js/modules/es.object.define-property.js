// 19.1.2.4 / 15.2.3.6 Object.defineProperty(O, P, Attributes)
require('./_export')({ target: 'Object', stat: true, forced: !require('core-js-internals/descriptors') }, {
  defineProperty: require('./_object-define-property').f
});
