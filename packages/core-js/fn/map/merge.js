require('../../modules/es.map');
require('../../modules/esnext.map.merge');

module.exports = require('../../modules/_entry-unbind')('Map', 'merge');
