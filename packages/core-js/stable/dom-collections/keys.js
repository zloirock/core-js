'use strict';
require('../../modules/es.array.keys');
require('../../modules/es.object.to-string');
require('../../modules/web.dom-collections.keys');
var entryUnbind = require('../../internals/entry-unbind');

module.exports = entryUnbind('Array', 'keys');
