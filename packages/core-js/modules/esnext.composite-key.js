var $ = require('../internals/export');
var getCompositeKeyNode = require('../internals/composite-key');
var getBuiltIn = require('../internals/get-built-in');

var create = Object.create;

var initializer = function () {
  return getBuiltIn('Object', 'freeze')(create(null));
};

// https://github.com/tc39/proposal-richer-keys/tree/master/compositeKey
$({ global: true }, {
  compositeKey: function compositeKey() {
    return getCompositeKeyNode.apply(Object, arguments).get('object', initializer);
  },
});
