'use strict';
require('../../modules/es.array.species');
require('../../modules/esnext.array.filter-reject');
var entryUnbind = require('../../internals/entry-unbind');

module.exports = entryUnbind('Array', 'filterReject');
