'use strict';
require('../../modules/es.string.repeat');
require('../../modules/es.number.to-fixed');
var entryUnbind = require('../../internals/entry-unbind');

module.exports = entryUnbind('Number', 'toFixed');
