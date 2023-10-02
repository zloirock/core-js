'use strict';
var parent = require('../../actual/string');
require('../../modules/es.weak-map');
// TODO: remove from `core-js@4`
require('../../modules/esnext.string.at');
require('../../modules/esnext.string.cooked');
require('../../modules/esnext.string.code-points');
require('../../modules/esnext.string.dedent');

module.exports = parent;
