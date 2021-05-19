require('../../modules/es.weak-set.constructor');
require('../../modules/esnext.weak-set.add-all');
var entryUnbind = require('../../internals/entry-unbind');

module.exports = entryUnbind('WeakSet', 'addAll');
