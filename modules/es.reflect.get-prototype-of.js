// 26.1.8 Reflect.getPrototypeOf(target)
var getProto = require('./_object-gpo');
var anObject = require('core-js-internals/an-object');

require('./_export')({ target: 'Reflect', stat: true }, {
  getPrototypeOf: function getPrototypeOf(target) {
    return getProto(anObject(target));
  }
});
