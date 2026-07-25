'use strict';
var parent = require('../../stable/promise');
require('../../modules/es.object.create');
require('../../modules/es.reflect.own-keys');
require('../../modules/esnext.promise.all-keyed');
require('../../modules/esnext.promise.all-settled-keyed');
// TODO: Remove from `core-js@4`
require('../../modules/esnext.promise.try');
require('../../modules/esnext.promise.with-resolvers');

module.exports = parent;
