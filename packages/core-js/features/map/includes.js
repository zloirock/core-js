require('../../modules/es.map');
require('../../modules/esnext.map.includes');

module.exports = require('../../internals/entry-unbind')('Map', 'includes');
