'use strict';
require('../../modules/es.array.keys');
require('../../modules/es.object.to-string');
var entryUnbind = require('../../internals/entry-unbind');

module.exports = entryUnbind('Array', 'keys');
