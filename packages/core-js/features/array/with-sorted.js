require('../../modules/es.array.sort');
require('../../modules/esnext.array.with-sorted');
var entryUnbind = require('../../internals/entry-unbind');

module.exports = entryUnbind('Array', 'withSorted');
