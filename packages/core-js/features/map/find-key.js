require('../../modules/es.map');
require('../../modules/esnext.map.find-key');

module.exports = require('../../internals/entry-unbind')('Map', 'findKey');
