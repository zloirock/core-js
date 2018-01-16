// 26.1.4 Reflect.deleteProperty(target, propertyKey)
var gOPD = require('./_object-gopd').f;
var anObject = require('./_an-object');

require('./_export')({ target: 'Reflect', stat: true }, {
  deleteProperty: function deleteProperty(target, propertyKey) {
    var desc = gOPD(anObject(target), propertyKey);
    return desc && !desc.configurable ? false : delete target[propertyKey];
  }
});
