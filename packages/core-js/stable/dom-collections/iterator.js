'use strict';
var uncurryThis = require('../../internals/function-uncurry-this');
var getIteratorMethod = require('../../internals/get-iterator-method');
require('../../modules/es.array.iterator');
require('../../modules/es.array.entries');
require('../../modules/es.array.keys');
require('../../modules/es.object.to-string');
require('../../modules/web.dom-collections.iterator');
require('../../modules/web.dom-collections.entries');
require('../../modules/web.dom-collections.keys');
require('../../modules/web.dom-collections.values');

module.exports = uncurryThis(getIteratorMethod([]));
