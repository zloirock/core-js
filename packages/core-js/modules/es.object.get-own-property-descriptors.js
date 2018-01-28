// 19.1.2.8 Object.getOwnPropertyDescriptors(O)
var ownKeys = require('./_own-keys');
var toIndexedObject = require('core-js-internals/to-indexed-object');
var gOPD = require('./_object-gopd');
var createProperty = require('./_create-property');

require('./_export')({ target: 'Object', stat: true }, {
  getOwnPropertyDescriptors: function getOwnPropertyDescriptors(object) {
    var O = toIndexedObject(object);
    var getDesc = gOPD.f;
    var keys = ownKeys(O);
    var result = {};
    var i = 0;
    var key, desc;
    while (keys.length > i) {
      desc = getDesc(O, key = keys[i++]);
      if (desc !== undefined) createProperty(result, key, desc);
    }
    return result;
  }
});
