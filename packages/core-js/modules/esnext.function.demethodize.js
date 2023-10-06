'use strict';
var $ = require('../internals/export');
var uncurryThis = require('../internals/function-uncurry-this');
var aCallable = require('../internals/a-callable');

// `Function.prototype.demethodize` method
// https://github.com/js-choi/proposal-function-demethodize
$({ target: 'Function', proto: true, forced: true }, {
  demethodize: function demethodize() {
    return uncurryThis(aCallable(this));
  },
});
