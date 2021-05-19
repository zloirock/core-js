require('../../modules/es.map.constructor');
require('../../modules/esnext.map.map-keys');
var entryUnbind = require('../../internals/entry-unbind');

module.exports = entryUnbind('Map', 'mapKeys');
