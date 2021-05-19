require('../../modules/es.set.constructor');
require('../../modules/esnext.set.join');
var entryUnbind = require('../../internals/entry-unbind');

module.exports = entryUnbind('Set', 'join');
