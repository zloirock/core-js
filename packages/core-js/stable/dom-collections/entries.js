'use strict';
require('../../modules/es.array.entries');
require('../../modules/es.object.to-string');
require('../../modules/web.dom-collections.entries');
var entryUnbind = require('../../internals/entry-unbind');

module.exports = entryUnbind('Array', 'entries');
