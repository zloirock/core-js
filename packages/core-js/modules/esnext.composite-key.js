'use strict';
var $ = require('../internals/export');
var apply = require('../internals/function-apply');
var getCompositeKeyNode = require('../internals/composite-key');

var $Object = Object;
var create = $Object.create;
var freeze = $Object.freeze;

var initializer = function () {
  return freeze(create(null));
};

// https://github.com/tc39/proposal-richer-keys/tree/master/compositeKey
$({ global: true, forced: true }, {
  compositeKey: function compositeKey() {
    return apply(getCompositeKeyNode, $Object, arguments).get('object', initializer);
  },
});
