'use strict';
require('../../modules/es.array.concat');
require('../../modules/es.array.species');
var entryUnbind = require('../../internals/entry-unbind');

module.exports = entryUnbind('Array', 'concat');
