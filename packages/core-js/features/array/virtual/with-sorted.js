require('../../../modules/es.array.sort');
require('../../../modules/esnext.array.with-sorted');
var entryVirtual = require('../../../internals/entry-virtual');

module.exports = entryVirtual('Array').withSorted;
