// TODO: remove from `core-js@4`
require('../modules/esnext.aggregate-error');

var parent = require('../stable/aggregate-error');
require('../modules/esnext.aggregate-error.cause');

module.exports = parent;
