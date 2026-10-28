'use strict';
require('../../modules/es.array.filter');
require('../../modules/es.array.species');
var entryUnbind = require('../../internals/entry-unbind');

module.exports = entryUnbind('Array', 'filter');
