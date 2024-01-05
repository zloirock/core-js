'use strict';
require('../../modules/es.array.entries');
require('../../modules/es.array.keys');
require('../../modules/es.array.values');
require('../../modules/es.object.to-string');
require('../../modules/web.dom-collections.iterator');
var entryUnbind = require('../../internals/entry-unbind');

module.exports = entryUnbind('Array', 'values');
