require('../../modules/es.set.constructor');
require('../../modules/esnext.set.add-all');
var entryUnbind = require('../../internals/entry-unbind');

module.exports = entryUnbind('Set', 'addAll');
