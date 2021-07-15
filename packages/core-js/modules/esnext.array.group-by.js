'use strict';
var $ = require('../internals/export');
var $groupBy = require('../internals/array-group-by');
var arraySpeciesCreate = require('../internals/array-species-create');
var addToUnscopables = require('../internals/add-to-unscopables');

// `Array.prototype.groupBy` method
// https://github.com/tc39/proposal-array-grouping
$({ target: 'Array', proto: true }, {
  groupBy: function groupBy(callbackfn /* , thisArg */) {
    return $groupBy(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined, arraySpeciesCreate);
  }
});

addToUnscopables('groupBy');
