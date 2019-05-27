require('../../modules/es.set');
require('../../modules/esnext.set.symmetric-difference');
var entryUnbind = require('../../internals/entry-unbind');

module.exports = entryUnbind('Set', 'symmetricDifference');
