require('../../modules/es.map.constructor');
require('../../modules/esnext.map.some');
var entryUnbind = require('../../internals/entry-unbind');

module.exports = entryUnbind('Map', 'some');
