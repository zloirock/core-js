'use strict';
require('../../modules/es.set.constructor');
require('../../modules/es.set.difference.v2');
var entryUnbind = require('../../internals/entry-unbind');

module.exports = entryUnbind('Set', 'difference');
