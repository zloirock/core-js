// 19.1.2.4 / 15.2.3.6 Object.defineProperty(O, P, Attributes)
require('./_export')({ target: 'Object', stat: true, forced: !require('./_descriptors') }, {
  defineProperty: require('./_object-dp').f
});
