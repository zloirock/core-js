// 26.1.3 Reflect.defineProperty(target, propertyKey, attributes)
var definePropertyModule = require('./_object-define-property');
var anObject = require('core-js-internals/an-object');
var toPrimitive = require('./_to-primitive');

// MS Edge has broken Reflect.defineProperty - throwing instead of returning false
require('./_export')({ target: 'Reflect', stat: true, forced: require('core-js-internals/fails')(function () {
  // eslint-disable-next-line no-undef
  Reflect.defineProperty(definePropertyModule.f({}, 1, { value: 1 }), 1, { value: 2 });
}) }, {
  defineProperty: function defineProperty(target, propertyKey, attributes) {
    anObject(target);
    propertyKey = toPrimitive(propertyKey, true);
    anObject(attributes);
    try {
      definePropertyModule.f(target, propertyKey, attributes);
      return true;
    } catch (e) {
      return false;
    }
  }
});
