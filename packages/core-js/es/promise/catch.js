require('../../modules/es.object.to-string');
require('../../modules/es.promise.constructor');
require('../../modules/es.promise.catch');
var entryUnbind = require('../../internals/entry-unbind');

module.exports = entryUnbind('Promise', 'catch');
