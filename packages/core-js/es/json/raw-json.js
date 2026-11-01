'use strict';
require('../../modules/es.object.create');
require('../../modules/es.object.freeze');
require('../../modules/es.object.keys');
require('../../modules/es.json.parse');
require('../../modules/es.json.raw-json');
require('../../modules/es.json.stringify');
var path = require('../../internals/path');

module.exports = path.JSON.rawJSON;
