'use strict';
require('../../modules/es.object.to-string');
require('../../modules/es.iterator.constructor');
require('../../modules/es.iterator.every');

var entryUnbind = require('../../internals/entry-unbind');

module.exports = entryUnbind('Iterator', 'every');
