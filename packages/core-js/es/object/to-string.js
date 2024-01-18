'use strict';
require('../../modules/es.json.to-string-tag');
require('../../modules/es.math.to-string-tag');
require('../../modules/es.object.to-string');
require('../../modules/es.reflect.to-string-tag');

var entryUnbind = require('../../internals/entry-unbind');

module.exports = entryUnbind('Object', 'toString');
