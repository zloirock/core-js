'use strict';
require('./url-search-params');
require('../modules/web.url.constructor');
require('../modules/web.url.can-parse');
require('../modules/web.url.parse');
require('../modules/web.url.to-json');
var path = require('../internals/path');

module.exports = path.URL;
