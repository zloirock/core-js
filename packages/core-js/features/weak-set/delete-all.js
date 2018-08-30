require('../../modules/es.weak-set');
require('../../modules/esnext.weak-set.delete-all');

module.exports = require('../../internals/entry-unbind')('WeakSet', 'deleteAll');
