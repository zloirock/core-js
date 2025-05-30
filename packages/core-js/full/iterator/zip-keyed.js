'use strict';
require('../../modules/es.array.iterator');
require('../../modules/es.object.to-string');
require('../../modules/es.object.create');
require('../../modules/es.iterator.constructor');
require('../../modules/es.reflect.own-keys');
require('../../modules/web.dom-collections.iterator');
require('../../modules/esnext.iterator.zip-keyed');

var entryUnbind = require('../../internals/entry-unbind');

module.exports = entryUnbind('Iterator', 'zipKeyed');
