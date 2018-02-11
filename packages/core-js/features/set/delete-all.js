require('../../modules/es.set');
require('../../modules/esnext.set.delete-all');

module.exports = require('../../internals/entry-unbind')('Set', 'deleteAll');
