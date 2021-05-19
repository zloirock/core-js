require('../../modules/es.map.constructor');
require('../../modules/esnext.map.map-values');
var entryUnbind = require('../../internals/entry-unbind');

module.exports = entryUnbind('Map', 'mapValues');
