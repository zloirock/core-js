var parent = require('./4');

require('../proposals/array-from-async-stage-2');
require('../proposals/array-grouping-stage-3-2');
require('../proposals/change-array-by-copy');
require('../proposals/explicit-resource-management');
require('../proposals/iterator-helpers-stage-3');
require('../proposals/set-methods-v2');
require('../proposals/well-formed-unicode-strings');
// TODO: Obsolete versions, remove from `core-js@4`
require('../proposals/array-grouping-stage-3');

module.exports = parent;
