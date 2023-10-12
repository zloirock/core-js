'use strict';
require('../../modules/es.array.from');
require('../../modules/es.array.iterator');
require('../../modules/es.object.assign');
require('../../modules/es.string.from-code-point');
require('../../modules/es.string.iterator');
require('../../modules/web.url.constructor');
require('../../modules/web.url.can-parse');
require('../../modules/web.url.parse');
require('../../modules/web.url.to-json');
require('../../modules/web.url-search-params.constructor');
require('../../modules/web.url-search-params.delete');
require('../../modules/web.url-search-params.has');
require('../../modules/web.url-search-params.size');
var path = require('../../internals/path');

module.exports = path.URL;
