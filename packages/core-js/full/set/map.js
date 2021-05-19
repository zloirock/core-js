require('../../modules/es.set.constructor');
require('../../modules/esnext.set.map');
var entryUnbind = require('../../internals/entry-unbind');

module.exports = entryUnbind('Set', 'map');
