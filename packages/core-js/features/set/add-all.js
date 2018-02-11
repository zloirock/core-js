require('../../modules/es.set');
require('../../modules/esnext.set.add-all');

module.exports = require('../../internals/entry-unbind')('Set', 'addAll');
