'use strict';
require('../../modules/es.array.from');
require('../../modules/es.array.iterator');
require('../../modules/es.object.assign');
require('../../modules/es.string.from-code-point');
require('../../modules/es.string.iterator');
require('../../modules/web.url.constructor');
require('../../modules/web.url.can-parse');
var path = require('../../internals/path');

module.exports = path.URL.canParse;
