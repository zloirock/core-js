'use strict';
require('../../modules/es.array.iterator');
require('../../modules/es.array.values');
require('../../modules/es.object.to-string');
var entryUnbind = require('../../internals/entry-unbind');

module.exports = entryUnbind('Array', 'values');
