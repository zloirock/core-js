require('../../modules/es.map.constructor');
require('../../modules/esnext.array.unique-by');
var entryUnbind = require('../../internals/entry-unbind');

module.exports = entryUnbind('Array', 'uniqueBy');
