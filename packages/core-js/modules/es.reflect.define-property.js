var definePropertyModule = require('../internals/object-define-property');
var anObject = require('../internals/an-object');
var toPrimitive = require('../internals/to-primitive');

// `Reflect.defineProperty` method
// https://tc39.github.io/ecma262/#sec-reflect.defineproperty
// MS Edge has broken Reflect.defineProperty - throwing instead of returning false
require('../internals/export')({ target: 'Reflect', stat: true, forced: require('../internals/fails')(function () {
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
