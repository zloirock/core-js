'use strict';
var parent = require('./1');

require('../proposals/function-demethodize');
require('../proposals/function-is-callable-is-constructor');
require('../proposals/url');
// TODO: Obsolete versions, remove from `core-js@4`:
require('../proposals/array-filtering');

module.exports = parent;
