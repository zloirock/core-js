require('../../modules/es.map');
require('../../modules/esnext.map.merge');

module.exports = require('../../internals/entry-unbind')('Map', 'merge');
