'use strict';
require('../../modules/es.set.constructor');
require('../../modules/esnext.set.delete-all');
var entryUnbind = require('../../internals/entry-unbind');

module.exports = entryUnbind('Set', 'deleteAll');
