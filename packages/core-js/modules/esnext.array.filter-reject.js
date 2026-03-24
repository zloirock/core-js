// @types: proposals/array-filtering
'use strict';
var $ = require('../internals/export');
var $filterReject = require('../internals/array-iteration').filterReject;
var arraySpeciesCreate = require('../internals/array-species-create');
var addToUnscopables = require('../internals/add-to-unscopables');

// `Array.prototype.filterReject` method
// https://github.com/tc39/proposal-array-filtering
$({ target: 'Array', proto: true, forced: true }, {
  filterReject: function filterReject(callbackfn /* , thisArg */) {
    return $filterReject(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined, arraySpeciesCreate);
  },
});

addToUnscopables('filterReject');
