require('../../modules/es.weak-map');
require('../../modules/esnext.weak-map.delete-all');

module.exports = require('../../internals/entry-unbind')('WeakMap', 'deleteAll');
