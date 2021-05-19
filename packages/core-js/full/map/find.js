require('../../modules/es.map.constructor');
require('../../modules/esnext.map.find');
var entryUnbind = require('../../internals/entry-unbind');

module.exports = entryUnbind('Map', 'find');
