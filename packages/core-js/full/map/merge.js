require('../../modules/es.map');
require('../../modules/esnext.map.merge');
var entryUnbind = require('../../internals/entry-unbind');

module.exports = entryUnbind('Map', 'merge');
