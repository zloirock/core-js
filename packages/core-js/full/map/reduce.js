require('../../modules/es.map.constructor');
require('../../modules/esnext.map.reduce');
var entryUnbind = require('../../internals/entry-unbind');

module.exports = entryUnbind('Map', 'reduce');
