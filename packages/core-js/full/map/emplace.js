require('../../modules/es.map.constructor');
require('../../modules/esnext.map.emplace');
var entryUnbind = require('../../internals/entry-unbind');

module.exports = entryUnbind('Map', 'emplace');
