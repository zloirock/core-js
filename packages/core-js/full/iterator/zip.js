'use strict';
require('../../modules/es.array.iterator');
require('../../modules/es.object.to-string');
require('../../modules/es.iterator.constructor');
require('../../modules/web.dom-collections.iterator');
require('../../modules/esnext.iterator.zip');

var entryUnbind = require('../../internals/entry-unbind');

module.exports = entryUnbind('Iterator', 'zip');
