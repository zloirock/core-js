var parent = require('./1');

require('../proposals/efficient-64-bit-arithmetic');
require('../proposals/function-is-callable-is-constructor');
require('../proposals/function-un-this');
require('../proposals/string-at');
require('../proposals/url');
// TODO: Obsolete versions, remove from `core-js@4`:
require('../proposals/array-filtering');

module.exports = parent;
