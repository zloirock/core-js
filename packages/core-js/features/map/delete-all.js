require('../../modules/es.map');
require('../../modules/esnext.map.delete-all');

module.exports = require('../../internals/entry-unbind')('Map', 'deleteAll');
