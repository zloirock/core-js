require('../../modules/es.map.constructor');
require('../../modules/esnext.map.delete-all');
var entryUnbind = require('../../internals/entry-unbind');

module.exports = entryUnbind('Map', 'deleteAll');
