require('../modules/esnext.error.cause');
// TODO: remove from `core-js@4`
require('../modules/esnext.aggregate-error');
require('../modules/esnext.aggregate-error.cause');

var parent = require('../stable/aggregate-error');

module.exports = parent;
