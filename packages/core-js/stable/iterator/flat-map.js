'use strict';
require('../../modules/es.object.to-string');
require('../../modules/es.array.iterator');
require('../../modules/es.iterator.constructor');
require('../../modules/es.iterator.flat-map');
require('../../modules/es.string.iterator');
require('../../modules/web.dom-collections.iterator');

var entryUnbind = require('../../internals/entry-unbind');

module.exports = entryUnbind('Iterator', 'flatMap');
