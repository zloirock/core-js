'use strict';
var parent = require('./4');

require('../proposals/decorator-metadata-v2');
require('../proposals/iterator-includes');
require('../proposals/iterator-join');
require('../proposals/joint-iteration');
require('../proposals/iterator-chunking-v2');
// TODO: Obsolete versions, remove from `core-js@4`
require('../proposals/iterator-helpers-stage-3');

module.exports = parent;
