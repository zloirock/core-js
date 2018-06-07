var getCompositeKeyNode = require('../internals/composite-key');
var create = require('../internals/object-create');
var $Object = require('../internals/path').Object;
var freeze = $Object && $Object.freeze;

var initializer = function () {
  return freeze ? freeze(create(null)) : create(null);
};

// https://github.com/bmeck/proposal-richer-keys/tree/master/compositeKey
require('../internals/export')({ global: true }, {
  compositeKey: function compositeKey() {
    return getCompositeKeyNode.apply(Object, arguments).get('object', initializer);
  }
});
