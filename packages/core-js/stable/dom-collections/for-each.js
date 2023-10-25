'use strict';
require('../../modules/es.array.for-each');
require('../../modules/web.dom-collections.for-each');
var entryUnbind = require('../../internals/entry-unbind');

module.exports = entryUnbind('Array', 'forEach');
