require('../../modules/es.weak-set');
require('../../modules/esnext.weak-set.add-all');

module.exports = require('../../internals/entry-unbind')('WeakSet', 'addAll');
