var parent = require('../../actual/promise');
require('../../modules/esnext.promise.with-resolvers');
// TODO: Remove from `core-js@4`
require('../../modules/esnext.aggregate-error');
require('../../modules/esnext.promise.all-settled');
require('../../modules/esnext.promise.try');
require('../../modules/esnext.promise.any');

module.exports = parent;
