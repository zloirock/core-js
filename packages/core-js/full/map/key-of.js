require('../../modules/es.map.constructor');
require('../../modules/esnext.map.key-of');
var entryUnbind = require('../../internals/entry-unbind');

module.exports = entryUnbind('Map', 'keyOf');
