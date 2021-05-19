require('../../modules/es.map.constructor');
require('../../modules/esnext.map.includes');
var entryUnbind = require('../../internals/entry-unbind');

module.exports = entryUnbind('Map', 'includes');
