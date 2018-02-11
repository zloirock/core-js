require('../../modules/es.map');
require('../../modules/esnext.map.filter');

module.exports = require('../../internals/entry-unbind')('Map', 'filter');
