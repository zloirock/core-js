require('../../modules/es.set');
require('../../modules/esnext.set.is-superset-of');
var entryUnbind = require('../../internals/entry-unbind');

module.exports = entryUnbind('Set', 'isSupersetOf');
