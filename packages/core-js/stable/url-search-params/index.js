'use strict';
require('../../modules/es.array.iterator');
require('../../modules/es.string.from-code-point');
require('../../modules/web.url-search-params.constructor');
require('../../modules/web.url-search-params.delete');
require('../../modules/web.url-search-params.has');
require('../../modules/web.url-search-params.size');
var path = require('../../internals/path');

module.exports = path.URLSearchParams;
