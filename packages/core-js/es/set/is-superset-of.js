'use strict';
require('../../modules/es.set.constructor');
require('../../modules/es.set.is-superset-of');
var entryUnbind = require('../../internals/entry-unbind');

module.exports = entryUnbind('Set', 'isSupersetOf');
