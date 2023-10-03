'use strict';
var parent = require('./4');

require('../proposals/decorator-metadata-v2');
require('../proposals/joint-iteration');
require('../proposals/map-upsert-v4');
// TODO: Obsolete versions, remove from `core-js@4`
require('../proposals/iterator-helpers-stage-3');

module.exports = parent;
