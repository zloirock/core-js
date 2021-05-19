require('../../modules/es.map.constructor');
require('../../modules/esnext.map.every');
var entryUnbind = require('../../internals/entry-unbind');

module.exports = entryUnbind('Map', 'every');
