var parent = require('./3');

require('../proposals/array-is-template-object');
require('../proposals/decorator-metadata');
require('../proposals/iterator-helpers');
require('../proposals/map-upsert-stage-2');
require('../proposals/set-methods');
require('../proposals/using-statement');
require('../proposals/well-formed-unicode-strings');
// TODO: Obsolete versions, remove from `core-js@4`
require('../proposals/array-grouping');
require('../proposals/decorators');

module.exports = parent;
