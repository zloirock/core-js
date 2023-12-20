'use strict';
require('../../modules/es.array-buffer.constructor');
require('../../modules/es.array-buffer.slice');
require('../../modules/es.data-view.constructor');
require('../../modules/es.data-view.set-int8');
require('../../modules/es.data-view.set-uint8');
require('../../modules/es.data-view.get-float16');
require('../../modules/es.data-view.set-float16');
require('../../modules/es.data-view.to-string-tag');
require('../../modules/es.object.to-string');
var path = require('../../internals/path');

module.exports = path.DataView;
