require('../../modules/es.set.constructor');
require('../../modules/esnext.set.reduce');
var entryUnbind = require('../../internals/entry-unbind');

module.exports = entryUnbind('Set', 'reduce');
